'use client';

import { useEffect, useState } from 'react';

import { usePanier } from '@/components/CartProvider';
import type { ProduitPublic } from '@/lib/catalogue';

type Props = {
  produit: ProduitPublic;
  epuise: boolean;
  /** Le restaurant prend-il des commandes en ce moment ? */
  ouvert: boolean;
};

/** Bouton « Ajouter » d'un plat, avec confirmation visible après l'ajout. */
export default function AddToCart({ produit, epuise, ouvert }: Props) {
  const { ajouter, ouvrirTiroir } = usePanier();
  const [ajoute, setAjoute] = useState(false);

  useEffect(() => {
    if (!ajoute) return;
    const minuterie = setTimeout(() => setAjoute(false), 2200);
    return () => clearTimeout(minuterie);
  }, [ajoute]);

  if (epuise) {
    return (
      <button type="button" className="bouton bouton-secondaire w-full" disabled>
        Épuisé
      </button>
    );
  }

  if (!ouvert) {
    return (
      <button type="button" className="bouton bouton-secondaire w-full" disabled>
        Commandes fermées
      </button>
    );
  }

  return (
    <button
      type="button"
      className="bouton bouton-action w-full"
      onClick={() => {
        ajouter({
          productId: produit.id,
          slug: produit.slug,
          name: produit.name,
          unit: produit.unit,
          priceMillimes: produit.priceMillimes,
        });
        setAjoute(true);
        ouvrirTiroir();
      }}
    >
      {ajoute ? 'Ajouté ✓' : 'Ajouter'}
    </button>
  );
}
