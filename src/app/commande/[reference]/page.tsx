import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { formatMillimes, suffixeUnite } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { aTelephone, site, telHref } from '@/lib/site';
import { LIBELLES_STATUT, type Statut } from '@/lib/validation';

export const metadata: Metadata = {
  title: 'Commande enregistrée',
  robots: { index: false, follow: false },
};

export default async function PageConfirmation({ params }: { params: { reference: string } }) {
  const commande = await prisma.order.findUnique({
    where: { reference: params.reference.toUpperCase() },
    include: { items: true },
  });

  if (!commande) notFound();

  const livraison = commande.type === 'DELIVERY';
  const statut = LIBELLES_STATUT[commande.status as Statut] ?? commande.status;

  return (
    <div className="conteneur max-w-3xl py-16">
      <p className="surtitre">Merci</p>
      <h1 className="mt-4">Commande enregistrée</h1>

      <div className="carte mt-8 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm text-encre/60">Votre référence</p>
            <p className="prix mt-1 text-2xl font-bold">{commande.reference}</p>
          </div>
          <span className="etiquette etiquette-dispo">{statut}</span>
        </div>
        <p className="mt-4 text-sm text-encre/70">
          Notez cette référence : elle nous permet de retrouver votre commande immédiatement.
        </p>
      </div>

      <section aria-labelledby="titre-suite" className="mt-12">
        <h2 id="titre-suite" className="text-xl">
          Ce qui se passe maintenant
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            'Nous vous appelons pour confirmer la commande et le délai.',
            livraison
              ? 'Nous préparons puis livrons à l’adresse indiquée.'
              : 'Nous préparons ; vous venez récupérer la commande au restaurant.',
            'Vous payez en espèces à la remise de la commande.',
          ].map((etape, index) => (
            <li key={etape} className="flex gap-4">
              <span className="prix text-citron">0{index + 1}</span>
              <span className="text-encre/80">{etape}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titre-recap" className="mt-12">
        <h2 id="titre-recap" className="text-xl">
          Récapitulatif
        </h2>

        <ul className="mt-4 divide-y divide-sel border-y border-sel">
          {commande.items.map((article) => (
            <li key={article.id} className="flex items-baseline justify-between gap-4 py-3">
              <span>
                <span className="prix text-sm text-encre/60">{article.quantity} ×</span>{' '}
                {article.name}
                <span className="prix ml-2 text-sm text-encre/50">
                  {formatMillimes(article.unitPriceMillimes)}
                  {suffixeUnite(article.unit)}
                </span>
              </span>
              <span className="prix whitespace-nowrap">
                {formatMillimes(article.lineTotalMillimes)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd className="prix">{formatMillimes(commande.subtotalMillimes)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{livraison ? 'Livraison' : 'À emporter'}</dt>
            <dd className="prix">
              {commande.deliveryMillimes > 0 ? formatMillimes(commande.deliveryMillimes) : '—'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-sel pt-2 text-base font-bold">
            <dt>À payer à la remise</dt>
            <dd className="prix">{formatMillimes(commande.totalMillimes)}</dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div className="carte p-4">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-port">Contact</p>
            <p className="mt-2">{commande.customerName}</p>
            <p className="prix">{commande.phone}</p>
          </div>
          <div className="carte p-4">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-port">
              {livraison ? 'Livraison' : 'Retrait'}
            </p>
            {livraison ? (
              <>
                <p className="mt-2">{commande.address}</p>
                {commande.city && <p>{commande.city}</p>}
              </>
            ) : (
              <p className="mt-2">Au restaurant</p>
            )}
            {commande.slot && <p className="mt-1 text-encre/70">Créneau : {commande.slot}</p>}
          </div>
        </div>

        {commande.note && (
          <p className="mt-4 border border-sel bg-white p-4 text-sm">
            <span className="font-semibold">Votre message : </span>
            {commande.note}
          </p>
        )}
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        {aTelephone() && (
          <a href={telHref()} className="bouton bouton-action">
            Appeler le restaurant
          </a>
        )}
        <Link href="/carte" className="bouton bouton-secondaire">
          Retour à la carte
        </Link>
      </div>

      {aTelephone() && (
        <p className="mt-4 text-sm text-encre/60">
          Un changement, une annulation ? Appelez-nous au{' '}
          <a href={telHref()} className="prix lien-souligne">
            {site.phone}
          </a>{' '}
          en indiquant la référence {commande.reference}.
        </p>
      )}
    </div>
  );
}
