import Link from 'next/link';

import { formatMillimes, suffixeUnite } from '@/lib/money';
import { prisma } from '@/lib/prisma';

const SEUIL_STOCK_BAS = 5;

/** Date du jour, fuseau de Tunis, en toutes lettres. */
function dateDuJour(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Tunis',
  }).format(new Date());
}

/**
 * L'ardoise du jour — élément signature du site.
 * Panneau sombre alimenté en direct par la base : c'est à la fois la
 * décoration principale et la preuve visible du système de stock.
 */
export default async function Ardoise() {
  const produits = await prisma.product.findMany({
    where: { isCatchOfDay: true },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      description: true,
      priceMillimes: true,
      unit: true,
      stock: true,
      isAvailable: true,
    },
  });

  return (
    <section
      aria-labelledby="titre-ardoise"
      // Ombre portée basse + filet intérieur clair : le panneau se décolle de la
      // page comme une ardoise posée contre un mur, sans effet de relief.
      className="bg-encre p-6 text-chaux shadow-[0_20px_50px_-30px_rgb(var(--encre-rvb)/0.8),inset_0_0_0_1px_rgb(var(--chaux-rvb)/0.08)] sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-chaux/20 pb-4">
        <h2 id="titre-ardoise" className="text-[1.6rem] text-chaux sm:text-[2rem]">
          L’ardoise du jour
        </h2>
        <p className="prix text-xs uppercase tracking-[0.12em] text-sel/55">{dateDuJour()}</p>
      </div>

      {produits.length === 0 ? (
        <p className="py-10 text-center text-sel/70">L’ardoise du jour sera publiée ce matin.</p>
      ) : (
        <ul className="divide-y divide-chaux/10">
          {produits.map((produit) => {
            const stock = produit.stock;
            const epuise = !produit.isAvailable || (stock !== null && stock <= 0);
            const stockBas = !epuise && stock !== null && stock <= SEUIL_STOCK_BAS;

            const note = epuise
              ? 'épuisé'
              : stockBas
                ? `quantité limitée — ${stock}`
                : (produit.description ?? '').replace(/^\[DÉMO\]\s*/, '').split('.')[0];

            return (
              <li
                key={produit.id}
                className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 sm:flex-nowrap ${
                  epuise ? 'text-sel/45' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`text-sm leading-none ${
                    epuise ? 'text-sel/40' : stockBas ? 'text-citron' : 'text-algue'
                  }`}
                >
                  ●
                </span>

                <span
                  className={`font-semibold ${epuise ? 'line-through decoration-1' : 'text-chaux'}`}
                >
                  {produit.name}
                </span>

                {/* Trait de conduite entre le nom et le prix, comme sur une ardoise. */}
                <span
                  aria-hidden="true"
                  className="filet-pointille hidden flex-1 self-center text-sel sm:block"
                />

                <span className="order-last w-full text-sm text-sel/60 sm:order-none sm:w-auto sm:max-w-[16rem] sm:truncate">
                  {note}
                </span>

                <span className="prix ml-auto whitespace-nowrap text-sm sm:ml-0">
                  {epuise ? (
                    <span className="text-sel/40">——</span>
                  ) : (
                    <>
                      {formatMillimes(produit.priceMillimes)}
                      <span className="text-sel/60">{suffixeUnite(produit.unit)}</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-chaux/20 pt-5">
        <Link href="/carte" className="bouton bouton-action">
          Commander
        </Link>
        <p className="text-xs text-sel/60">
          <span className="text-algue">●</span> disponible ·{' '}
          <span className="text-citron">●</span> quantité limitée ·{' '}
          <span className="text-sel/40">●</span> épuisé
        </p>
      </div>
    </section>
  );
}
