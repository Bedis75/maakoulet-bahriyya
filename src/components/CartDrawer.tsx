'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { usePanier } from '@/components/CartProvider';
import { formatMillimes, suffixeUnite } from '@/lib/money';

/** Tiroir latéral du panier, ouvert depuis l'en-tête ou après un ajout. */
export default function CartDrawer() {
  const { lignes, sousTotal, tiroirOuvert, fermerTiroir, definirQuantite, retirer } = usePanier();

  useEffect(() => {
    if (!tiroirOuvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermerTiroir();
    };
    document.addEventListener('keydown', surTouche);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = '';
    };
  }, [tiroirOuvert, fermerTiroir]);

  if (!tiroirOuvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Votre panier">
      <button
        type="button"
        aria-label="Fermer le panier"
        onClick={fermerTiroir}
        className="absolute inset-0 bg-encre/50"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-chaux shadow-xl">
        <header className="flex items-center justify-between border-b border-sel px-5 py-4">
          <h2 className="text-lg font-bold">Votre panier</h2>
          <button
            type="button"
            onClick={fermerTiroir}
            className="px-2 py-1 text-2xl leading-none text-encre/70 hover:text-encre"
            aria-label="Fermer le panier"
          >
            ×
          </button>
        </header>

        {lignes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-encre/70">Votre panier est vide.</p>
            <Link href="/carte" className="bouton bouton-secondaire" onClick={fermerTiroir}>
              Voir la carte
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sel overflow-y-auto px-5">
              {lignes.map((ligne) => (
                <li key={ligne.productId} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{ligne.name}</p>
                      <p className="prix text-sm text-encre/60">
                        {formatMillimes(ligne.priceMillimes)}
                        {suffixeUnite(ligne.unit)}
                      </p>
                    </div>
                    <p className="prix whitespace-nowrap font-semibold">
                      {formatMillimes(ligne.priceMillimes * ligne.quantity)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-sel bg-white">
                      <button
                        type="button"
                        className="h-11 w-11 text-lg leading-none hover:bg-sel"
                        onClick={() => definirQuantite(ligne.productId, ligne.quantity - 1)}
                        aria-label={`Retirer un ${ligne.name}`}
                      >
                        −
                      </button>
                      <span className="prix w-10 text-center text-sm">{ligne.quantity}</span>
                      <button
                        type="button"
                        className="h-11 w-11 text-lg leading-none hover:bg-sel"
                        onClick={() => definirQuantite(ligne.productId, ligne.quantity + 1)}
                        aria-label={`Ajouter un ${ligne.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => retirer(ligne.productId)}
                      className="text-sm text-harissa underline underline-offset-2"
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-sel px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">Sous-total</span>
                <span className="prix text-lg font-bold">{formatMillimes(sousTotal)}</span>
              </div>
              <p className="mb-3 text-xs text-encre/60">
                Frais de livraison calculés à l’étape suivante.
              </p>
              <Link
                href="/panier"
                onClick={fermerTiroir}
                className="bouton bouton-action w-full"
              >
                Commander
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
