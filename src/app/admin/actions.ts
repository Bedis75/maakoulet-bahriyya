'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { connecter, deconnecter, exigerSession } from '@/lib/auth';
import { dinarsVersMillimes } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import {
  categorieSchema,
  connexionSchema,
  produitSchema,
  reglagesSchema,
  statutSchema,
} from '@/lib/validation';

/** Retour d'action affiché à l'écran : jamais de mutation silencieuse. */
export type EtatAction = { ok: boolean; message: string } | null;

/** Rafraîchit le site public ET le back-office après une modification. */
function rafraichirTout() {
  revalidatePath('/');
  revalidatePath('/carte');
  revalidatePath('/admin');
  revalidatePath('/admin/carte');
}

function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Ajoute un suffixe numérique tant que le slug est déjà pris. */
async function slugLibre(
  base: string,
  table: 'product' | 'category',
  idAExclure?: number,
): Promise<string> {
  const racine = base || 'element';
  for (let suffixe = 0; suffixe < 100; suffixe += 1) {
    const candidat = suffixe === 0 ? racine : `${racine}-${suffixe + 1}`;
    const existant =
      table === 'product'
        ? await prisma.product.findUnique({ where: { slug: candidat }, select: { id: true } })
        : await prisma.category.findUnique({ where: { slug: candidat }, select: { id: true } });
    if (!existant || existant.id === idAExclure) return candidat;
  }
  return `${racine}-${Date.now()}`;
}

function premierMessage(erreur: { issues: { message: string }[] }): string {
  return erreur.issues[0]?.message ?? 'Formulaire invalide.';
}

/* ========================================================================== */
/*  Connexion                                                                 */
/* ========================================================================== */

export async function connexionAction(_etat: EtatAction, donnees: FormData): Promise<EtatAction> {
  const analyse = connexionSchema.safeParse({
    email: donnees.get('email'),
    motDePasse: donnees.get('motDePasse'),
  });
  if (!analyse.success) return { ok: false, message: premierMessage(analyse.error) };

  const resultat = await connecter(analyse.data.email, analyse.data.motDePasse);
  if (!resultat.ok) return { ok: false, message: resultat.erreur };

  const suite = String(donnees.get('suite') ?? '/admin');
  redirect(suite.startsWith('/admin') ? suite : '/admin');
}

export async function deconnexionAction(): Promise<void> {
  deconnecter();
  redirect('/admin/login');
}

/* ========================================================================== */
/*  Commandes                                                                 */
/* ========================================================================== */

export async function changerStatutAction(
  orderId: number,
  statut: string,
): Promise<EtatAction> {
  await exigerSession();

  const analyse = statutSchema.safeParse(statut);
  if (!analyse.success) return { ok: false, message: 'Statut inconnu.' };

  await prisma.order.update({ where: { id: orderId }, data: { status: analyse.data } });

  revalidatePath('/admin');
  revalidatePath('/admin/commandes');
  return { ok: true, message: 'Statut mis à jour.' };
}

/* ========================================================================== */
/*  Carte — modifications rapides                                             */
/* ========================================================================== */

export async function enregistrerPrixAction(
  productId: number,
  saisie: string,
): Promise<EtatAction> {
  await exigerSession();

  const millimes = dinarsVersMillimes(saisie);
  if (millimes === null) {
    return { ok: false, message: 'Prix invalide. Exemple : 45,500' };
  }

  await prisma.product.update({ where: { id: productId }, data: { priceMillimes: millimes } });
  rafraichirTout();
  return { ok: true, message: 'Prix enregistré.' };
}

export async function enregistrerStockAction(
  productId: number,
  saisie: string,
): Promise<EtatAction> {
  await exigerSession();

  const texte = saisie.trim();
  let stock: number | null = null;

  if (texte !== '') {
    const valeur = Number(texte);
    if (!Number.isInteger(valeur) || valeur < 0) {
      return { ok: false, message: 'Stock invalide : un nombre entier, ou vide pour illimité.' };
    }
    stock = valeur;
  }

  await prisma.product.update({ where: { id: productId }, data: { stock } });
  rafraichirTout();
  return {
    ok: true,
    message: stock === null ? 'Stock illimité enregistré.' : `Stock enregistré : ${stock}.`,
  };
}

export async function basculerDisponibiliteAction(
  productId: number,
  valeur: boolean,
): Promise<EtatAction> {
  await exigerSession();
  await prisma.product.update({ where: { id: productId }, data: { isAvailable: valeur } });
  rafraichirTout();
  return { ok: true, message: valeur ? 'Plat disponible.' : 'Plat marqué épuisé.' };
}

export async function basculerArrivageAction(
  productId: number,
  valeur: boolean,
): Promise<EtatAction> {
  await exigerSession();
  await prisma.product.update({ where: { id: productId }, data: { isCatchOfDay: valeur } });
  rafraichirTout();
  return {
    ok: true,
    message: valeur ? 'Ajouté à l’ardoise du jour.' : 'Retiré de l’ardoise du jour.',
  };
}

export async function deplacerProduitAction(
  productId: number,
  direction: 'haut' | 'bas',
): Promise<EtatAction> {
  await exigerSession();

  const produit = await prisma.product.findUnique({ where: { id: productId } });
  if (!produit) return { ok: false, message: 'Plat introuvable.' };

  const voisins = await prisma.product.findMany({
    where: { categoryId: produit.categoryId },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
  });

  const index = voisins.findIndex((p) => p.id === productId);
  const cible = direction === 'haut' ? index - 1 : index + 1;
  if (cible < 0 || cible >= voisins.length) return { ok: false, message: 'Déjà à l’extrémité.' };

  const ordonnes = [...voisins];
  [ordonnes[index], ordonnes[cible]] = [ordonnes[cible], ordonnes[index]];

  await prisma.$transaction(
    ordonnes.map((p, position) =>
      prisma.product.update({ where: { id: p.id }, data: { position } }),
    ),
  );

  rafraichirTout();
  return { ok: true, message: 'Ordre mis à jour.' };
}

/* ========================================================================== */
/*  Carte — produits                                                          */
/* ========================================================================== */

function lireProduit(donnees: FormData) {
  return produitSchema.safeParse({
    name: donnees.get('name'),
    description: donnees.get('description') ?? '',
    prix: donnees.get('prix'),
    unit: donnees.get('unit'),
    categoryId: donnees.get('categoryId'),
    stock: donnees.get('stock') ?? '',
    imageUrl: donnees.get('imageUrl') ?? '',
    isAvailable: donnees.get('isAvailable') === 'on',
    isCatchOfDay: donnees.get('isCatchOfDay') === 'on',
  });
}

function lireStock(saisie: string | undefined): number | null | 'invalide' {
  const texte = (saisie ?? '').trim();
  if (texte === '') return null;
  const valeur = Number(texte);
  if (!Number.isInteger(valeur) || valeur < 0) return 'invalide';
  return valeur;
}

export async function creerProduitAction(
  _etat: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  await exigerSession();

  const analyse = lireProduit(donnees);
  if (!analyse.success) return { ok: false, message: premierMessage(analyse.error) };

  const millimes = dinarsVersMillimes(analyse.data.prix);
  if (millimes === null) return { ok: false, message: 'Prix invalide. Exemple : 45,500' };

  const stock = lireStock(analyse.data.stock);
  if (stock === 'invalide') {
    return { ok: false, message: 'Stock invalide : un nombre entier, ou vide pour illimité.' };
  }

  const dernier = await prisma.product.findFirst({
    where: { categoryId: analyse.data.categoryId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  await prisma.product.create({
    data: {
      slug: await slugLibre(slugifier(analyse.data.name), 'product'),
      name: analyse.data.name,
      description: analyse.data.description || null,
      priceMillimes: millimes,
      unit: analyse.data.unit,
      imageUrl: analyse.data.imageUrl || null,
      stock,
      isAvailable: analyse.data.isAvailable ?? true,
      isCatchOfDay: analyse.data.isCatchOfDay ?? false,
      position: (dernier?.position ?? -1) + 1,
      categoryId: analyse.data.categoryId,
    },
  });

  rafraichirTout();
  return { ok: true, message: `« ${analyse.data.name} » ajouté à la carte.` };
}

export async function modifierProduitAction(
  _etat: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  await exigerSession();

  const id = Number(donnees.get('productId'));
  if (!Number.isInteger(id)) return { ok: false, message: 'Plat introuvable.' };

  const analyse = lireProduit(donnees);
  if (!analyse.success) return { ok: false, message: premierMessage(analyse.error) };

  const millimes = dinarsVersMillimes(analyse.data.prix);
  if (millimes === null) return { ok: false, message: 'Prix invalide. Exemple : 45,500' };

  const stock = lireStock(analyse.data.stock);
  if (stock === 'invalide') {
    return { ok: false, message: 'Stock invalide : un nombre entier, ou vide pour illimité.' };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: analyse.data.name,
      description: analyse.data.description || null,
      priceMillimes: millimes,
      unit: analyse.data.unit,
      imageUrl: analyse.data.imageUrl || null,
      stock,
      isAvailable: analyse.data.isAvailable ?? false,
      isCatchOfDay: analyse.data.isCatchOfDay ?? false,
      categoryId: analyse.data.categoryId,
    },
  });

  rafraichirTout();
  return { ok: true, message: 'Plat enregistré.' };
}

export async function supprimerProduitAction(productId: number): Promise<EtatAction> {
  await exigerSession();
  await prisma.product.delete({ where: { id: productId } });
  rafraichirTout();
  return { ok: true, message: 'Plat supprimé.' };
}

/* ========================================================================== */
/*  Carte — catégories                                                        */
/* ========================================================================== */

export async function creerCategorieAction(
  _etat: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  await exigerSession();

  const analyse = categorieSchema.safeParse({
    name: donnees.get('name'),
    description: donnees.get('description') ?? '',
  });
  if (!analyse.success) return { ok: false, message: premierMessage(analyse.error) };

  const derniere = await prisma.category.findFirst({
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  await prisma.category.create({
    data: {
      slug: await slugLibre(slugifier(analyse.data.name), 'category'),
      name: analyse.data.name,
      description: analyse.data.description || null,
      position: (derniere?.position ?? -1) + 1,
    },
  });

  rafraichirTout();
  return { ok: true, message: `Catégorie « ${analyse.data.name} » créée.` };
}

export async function modifierCategorieAction(
  _etat: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  await exigerSession();

  const id = Number(donnees.get('categoryId'));
  if (!Number.isInteger(id)) return { ok: false, message: 'Catégorie introuvable.' };

  const analyse = categorieSchema.safeParse({
    name: donnees.get('name'),
    description: donnees.get('description') ?? '',
  });
  if (!analyse.success) return { ok: false, message: premierMessage(analyse.error) };

  await prisma.category.update({
    where: { id },
    data: {
      name: analyse.data.name,
      description: analyse.data.description || null,
    },
  });

  rafraichirTout();
  return { ok: true, message: 'Catégorie enregistrée.' };
}

export async function supprimerCategorieAction(categoryId: number): Promise<EtatAction> {
  await exigerSession();

  const nbProduits = await prisma.product.count({ where: { categoryId } });
  if (nbProduits > 0) {
    return {
      ok: false,
      message: `Impossible : ${nbProduits} plat(s) sont encore dans cette catégorie.`,
    };
  }

  await prisma.category.delete({ where: { id: categoryId } });
  rafraichirTout();
  return { ok: true, message: 'Catégorie supprimée.' };
}

export async function deplacerCategorieAction(
  categoryId: number,
  direction: 'haut' | 'bas',
): Promise<EtatAction> {
  await exigerSession();

  const categories = await prisma.category.findMany({ orderBy: { position: 'asc' } });
  const index = categories.findIndex((c) => c.id === categoryId);
  if (index === -1) return { ok: false, message: 'Catégorie introuvable.' };

  const cible = direction === 'haut' ? index - 1 : index + 1;
  if (cible < 0 || cible >= categories.length) return { ok: false, message: 'Déjà à l’extrémité.' };

  const ordonnees = [...categories];
  [ordonnees[index], ordonnees[cible]] = [ordonnees[cible], ordonnees[index]];

  await prisma.$transaction(
    ordonnees.map((c, position) =>
      prisma.category.update({ where: { id: c.id }, data: { position } }),
    ),
  );

  rafraichirTout();
  return { ok: true, message: 'Ordre des catégories mis à jour.' };
}

/* ========================================================================== */
/*  Réglages                                                                  */
/* ========================================================================== */

export async function enregistrerReglagesAction(
  _etat: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  await exigerSession();

  const analyse = reglagesSchema.safeParse({
    isOpenForOrders: donnees.get('isOpenForOrders') === 'on',
    fraisLivraison: donnees.get('fraisLivraison') ?? '0',
    minimumCommande: donnees.get('minimumCommande') ?? '0',
    deliveryZones: donnees.get('deliveryZones') ?? '',
    announcement: donnees.get('announcement') ?? '',
  });
  if (!analyse.success) return { ok: false, message: premierMessage(analyse.error) };

  const frais = dinarsVersMillimes(analyse.data.fraisLivraison || '0');
  const minimum = dinarsVersMillimes(analyse.data.minimumCommande || '0');
  if (frais === null) return { ok: false, message: 'Frais de livraison invalides.' };
  if (minimum === null) return { ok: false, message: 'Minimum de commande invalide.' };

  const zones = analyse.data.deliveryZones
    .split(',')
    .map((zone) => zone.trim())
    .filter(Boolean)
    .join(', ');

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      isOpenForOrders: analyse.data.isOpenForOrders,
      deliveryFeeMillimes: frais,
      minOrderMillimes: minimum,
      deliveryZones: zones,
      announcement: analyse.data.announcement || null,
    },
    create: {
      id: 1,
      isOpenForOrders: analyse.data.isOpenForOrders,
      deliveryFeeMillimes: frais,
      minOrderMillimes: minimum,
      deliveryZones: zones,
      announcement: analyse.data.announcement || null,
    },
  });

  rafraichirTout();
  revalidatePath('/panier');
  revalidatePath('/contact');
  revalidatePath('/admin/reglages');
  return { ok: true, message: 'Réglages enregistrés.' };
}
