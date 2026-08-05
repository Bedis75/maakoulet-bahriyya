'use client';

import { useMemo, useState } from 'react';

import AddToCart from '@/components/AddToCart';
import DishImage from '@/components/DishImage';
import { estEpuise, estStockBas, type CategoriePublique } from '@/lib/catalogue';
import { prixAvecUnite } from '@/lib/money';

type Props = {
  categories: CategoriePublique[];
  ouvert: boolean;
};

const TOUTES = 'toutes';

/** La carte complète avec ses filtres — aucun rechargement de page. */
export default function MenuBrowser({ categories, ouvert }: Props) {
  const [filtre, setFiltre] = useState<string>(TOUTES);

  const affichees = useMemo(
    () => (filtre === TOUTES ? categories : categories.filter((c) => c.slug === filtre)),
    [categories, filtre],
  );

  if (categories.length === 0) {
    return (
      <p className="mt-10 text-encre/70">
        La carte est en cours de préparation. Elle sera publiée très prochainement.
      </p>
    );
  }

  return (
    <>
      <div
        role="group"
        aria-label="Filtrer la carte par catégorie"
        className="sticky top-[72px] z-30 -mx-5 mt-8 overflow-x-auto border-y border-sel bg-chaux/95 px-5 py-3 backdrop-blur md:mx-0 md:px-0"
      >
        <div className="flex gap-2">
          <BoutonFiltre actif={filtre === TOUTES} onClick={() => setFiltre(TOUTES)}>
            Tout
          </BoutonFiltre>
          {categories.map((categorie) => (
            <BoutonFiltre
              key={categorie.slug}
              actif={filtre === categorie.slug}
              onClick={() => setFiltre(categorie.slug)}
            >
              {categorie.name}
            </BoutonFiltre>
          ))}
        </div>
      </div>

      <div className="mt-14 space-y-20">
        {affichees.map((categorie) => (
          <section key={categorie.id} id={categorie.slug} className="scroll-mt-40">
            <h2 className="border-b border-sel pb-3">{categorie.name}</h2>
            {categorie.description && (
              <p className="mt-4 max-w-lecture text-encre/75">{categorie.description}</p>
            )}

            {categorie.produits.length === 0 ? (
              <p className="mt-6 text-encre/60">Rien dans cette catégorie pour le moment.</p>
            ) : (
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categorie.produits.map((produit) => {
                  const epuise = estEpuise(produit);
                  const stockBas = estStockBas(produit);

                  return (
                    <li
                      key={produit.id}
                      className={`carte flex flex-col overflow-hidden ${epuise ? 'opacity-70' : ''}`}
                    >
                      <div className="relative">
                        <DishImage
                          imageUrl={produit.imageUrl}
                          nom={produit.name}
                          categorie={categorie.slug}
                          className="aspect-[4/3] w-full"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {produit.isCatchOfDay && !epuise && (
                            <span className="etiquette etiquette-jour bg-chaux">Du jour</span>
                          )}
                          {epuise && (
                            <span className="etiquette etiquette-epuise bg-chaux">Épuisé</span>
                          )}
                          {stockBas && (
                            <span className="etiquette etiquette-dispo bg-chaux">
                              Plus que {produit.stock}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-titre text-lg font-bold">{produit.name}</h3>
                        {produit.description && (
                          <p className="mt-2 text-sm text-encre/70">{produit.description}</p>
                        )}
                        <p className="prix mt-4 text-lg font-semibold">
                          {prixAvecUnite(produit.priceMillimes, produit.unit)}
                        </p>
                        <div className="mt-4 pt-1">
                          <AddToCart produit={produit} epuise={epuise} ouvert={ouvert} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

function BoutonFiltre({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`whitespace-nowrap border px-4 py-2 text-sm font-semibold transition-colors ${
        actif
          ? 'border-encre bg-encre text-chaux'
          : 'border-sel bg-white text-encre hover:border-vague'
      }`}
    >
      {children}
    </button>
  );
}
