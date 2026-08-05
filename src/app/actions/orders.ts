'use server';

import { randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';

import { estEpuise } from '@/lib/catalogue';
import { prisma } from '@/lib/prisma';
import { getReglages } from '@/lib/settings';
import { commandeSchema } from '@/lib/validation';

export type LigneRevalidee = {
  productId: number;
  slug: string;
  name: string;
  unit: string;
  priceMillimes: number;
  quantity: number;
};

export type ResultatCommande =
  | { ok: true; reference: string }
  | {
      ok: false;
      /** Message général affiché en haut du formulaire. */
      message: string;
      /** Erreurs par champ, pour l'affichage sous chaque champ. */
      champs?: Record<string, string>;
      /** Panier corrigé à appliquer côté client (prix mis à jour, ruptures retirées). */
      panierCorrige?: LigneRevalidee[];
    };

/** MB-4F2A9C */
function nouvelleReference(): string {
  return `MB-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

class RuptureDeStock extends Error {
  constructor(public produit: string) {
    super(`Rupture de stock : ${produit}`);
  }
}

/**
 * Tunnel de commande.
 * Règle absolue : rien de ce qui vient du navigateur n'est cru sur parole.
 * Les prix, la disponibilité, les frais et le total sont relus et recalculés ici.
 */
export async function passerCommande(donneesBrutes: unknown): Promise<ResultatCommande> {
  const analyse = commandeSchema.safeParse(donneesBrutes);

  if (!analyse.success) {
    const champs: Record<string, string> = {};
    for (const probleme of analyse.error.issues) {
      const cle = probleme.path[0];
      if (typeof cle === 'string' && !champs[cle]) champs[cle] = probleme.message;
    }
    return {
      ok: false,
      message: 'Merci de corriger les informations signalées.',
      champs,
    };
  }

  const commande = analyse.data;
  const reglages = await getReglages();

  if (!reglages.isOpenForOrders) {
    return {
      ok: false,
      message: 'Nous ne prenons pas de commandes en ligne pour le moment.',
    };
  }

  // 1. Relecture des produits en base ---------------------------------------
  const produits = await prisma.product.findMany({
    where: { id: { in: commande.lignes.map((ligne) => ligne.productId) } },
  });
  const parId = new Map(produits.map((produit) => [produit.id, produit]));

  const problemes: string[] = [];
  const panierCorrige: LigneRevalidee[] = [];
  const lignesValides: {
    produitId: number;
    name: string;
    unit: string;
    unitPriceMillimes: number;
    quantity: number;
    limite: boolean;
  }[] = [];

  for (const ligne of commande.lignes) {
    const produit = parId.get(ligne.productId);

    if (!produit) {
      problemes.push('Un plat de votre panier n’est plus proposé ; il a été retiré.');
      continue;
    }

    if (estEpuise(produit)) {
      problemes.push(`« ${produit.name} » est épuisé ; il a été retiré de votre panier.`);
      continue;
    }

    let quantite = ligne.quantity;
    if (produit.stock !== null && produit.stock < quantite) {
      quantite = produit.stock;
      problemes.push(
        `Il ne reste que ${produit.stock} × « ${produit.name} » ; la quantité a été ajustée.`,
      );
    }

    panierCorrige.push({
      productId: produit.id,
      slug: produit.slug,
      name: produit.name,
      unit: produit.unit,
      priceMillimes: produit.priceMillimes,
      quantity: quantite,
    });

    lignesValides.push({
      produitId: produit.id,
      name: produit.name,
      unit: produit.unit,
      unitPriceMillimes: produit.priceMillimes,
      quantity: quantite,
      limite: produit.stock !== null,
    });
  }

  // 2. Le panier est-il encore commandable ? --------------------------------
  if (lignesValides.length === 0) {
    return {
      ok: false,
      message:
        problemes.join(' ') ||
        'Votre panier est vide. Ajoutez au moins un plat avant de commander.',
      panierCorrige: [],
    };
  }

  if (problemes.length > 0) {
    return {
      ok: false,
      message: `${problemes.join(' ')} Vérifiez votre panier puis validez à nouveau.`,
      panierCorrige,
    };
  }

  // 3. Totaux recalculés côté serveur ---------------------------------------
  const subtotalMillimes = lignesValides.reduce(
    (total, ligne) => total + ligne.unitPriceMillimes * ligne.quantity,
    0,
  );
  const deliveryMillimes =
    commande.type === 'DELIVERY' ? reglages.deliveryFeeMillimes : 0;
  const totalMillimes = subtotalMillimes + deliveryMillimes;

  if (
    commande.type === 'DELIVERY' &&
    reglages.minOrderMillimes > 0 &&
    subtotalMillimes < reglages.minOrderMillimes
  ) {
    return {
      ok: false,
      message: `Le minimum de commande en livraison n’est pas atteint. Ajoutez des articles pour continuer.`,
      panierCorrige,
    };
  }

  // 4. Écriture : décrément du stock puis création de la commande ------------
  const MAX_TENTATIVES = 5;

  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative += 1) {
    const reference = nouvelleReference();

    try {
      await prisma.$transaction(async (tx) => {
        for (const ligne of lignesValides) {
          if (!ligne.limite) continue;
          // Décrément conditionnel : si le stock est passé sous la quantité
          // entre-temps, aucune ligne n'est mise à jour et on annule tout.
          const resultat = await tx.product.updateMany({
            where: { id: ligne.produitId, stock: { gte: ligne.quantity } },
            data: { stock: { decrement: ligne.quantity } },
          });
          if (resultat.count === 0) throw new RuptureDeStock(ligne.name);
        }

        await tx.order.create({
          data: {
            reference,
            type: commande.type,
            status: 'NEW',
            customerName: commande.customerName,
            phone: commande.phone,
            address: commande.type === 'DELIVERY' ? commande.address || null : null,
            city: commande.type === 'DELIVERY' ? commande.city || null : null,
            slot: commande.slot || null,
            note: commande.note || null,
            subtotalMillimes,
            deliveryMillimes,
            totalMillimes,
            items: {
              create: lignesValides.map((ligne) => ({
                productId: ligne.produitId,
                name: ligne.name,
                unit: ligne.unit,
                unitPriceMillimes: ligne.unitPriceMillimes,
                quantity: ligne.quantity,
                lineTotalMillimes: ligne.unitPriceMillimes * ligne.quantity,
              })),
            },
          },
        });
      });

      revalidatePath('/');
      revalidatePath('/carte');
      revalidatePath('/admin');
      revalidatePath('/admin/commandes');

      return { ok: true, reference };
    } catch (erreur) {
      if (erreur instanceof RuptureDeStock) {
        return {
          ok: false,
          message: `« ${erreur.produit} » vient d’être épuisé. Votre panier a été mis à jour.`,
          panierCorrige: panierCorrige.filter((ligne) => ligne.name !== erreur.produit),
        };
      }
      // Collision de référence (contrainte d'unicité) : on retente avec une autre.
      const estCollision =
        typeof erreur === 'object' &&
        erreur !== null &&
        'code' in erreur &&
        (erreur as { code?: string }).code === 'P2002';
      if (!estCollision) throw erreur;
    }
  }

  return {
    ok: false,
    message: 'Impossible d’enregistrer la commande. Merci de réessayer dans un instant.',
  };
}

/**
 * Relit prix et disponibilité d'un panier — appelé à l'ouverture de la page
 * panier pour que le client ne découvre pas le problème au moment de valider.
 */
export async function revaliderPanier(
  lignes: { productId: number; quantity: number; priceMillimes?: number }[],
): Promise<{ lignes: LigneRevalidee[]; avertissements: string[] }> {
  if (lignes.length === 0) return { lignes: [], avertissements: [] };

  const produits = await prisma.product.findMany({
    where: { id: { in: lignes.map((ligne) => ligne.productId) } },
  });
  const parId = new Map(produits.map((produit) => [produit.id, produit]));

  const avertissements: string[] = [];
  const resultat: LigneRevalidee[] = [];

  for (const ligne of lignes) {
    const produit = parId.get(ligne.productId);
    if (!produit) {
      avertissements.push('Un plat de votre panier n’est plus proposé ; il a été retiré.');
      continue;
    }
    if (estEpuise(produit)) {
      avertissements.push(`« ${produit.name} » est épuisé ; il a été retiré de votre panier.`);
      continue;
    }

    let quantite = ligne.quantity;
    if (produit.stock !== null && produit.stock < quantite) {
      quantite = produit.stock;
      avertissements.push(
        `Il ne reste que ${produit.stock} × « ${produit.name} » ; la quantité a été ajustée.`,
      );
    }

    if (
      typeof ligne.priceMillimes === 'number' &&
      ligne.priceMillimes !== produit.priceMillimes
    ) {
      avertissements.push(
        `Le prix de « ${produit.name} » a changé ; le tarif du jour a été appliqué.`,
      );
    }

    resultat.push({
      productId: produit.id,
      slug: produit.slug,
      name: produit.name,
      unit: produit.unit,
      priceMillimes: produit.priceMillimes,
      quantity: quantite,
    });
  }

  return { lignes: resultat, avertissements };
}
