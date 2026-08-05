import type { Metadata } from 'next';
import Link from 'next/link';

import SelecteurStatut from '@/components/admin/SelecteurStatut';
import { exigerSession } from '@/lib/auth';
import { dateHeureCourte } from '@/lib/dates';
import { formatMillimes, suffixeUnite } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { LIBELLES_STATUT, STATUTS, type Statut } from '@/lib/validation';

export const metadata: Metadata = { title: 'Commandes' };

type Recherche = {
  statut?: string;
  tri?: string;
  reference?: string;
};

export default async function PageCommandes({ searchParams }: { searchParams: Recherche }) {
  await exigerSession();

  const statutFiltre = STATUTS.includes(searchParams.statut as Statut)
    ? (searchParams.statut as Statut)
    : null;
  const ancienDabord = searchParams.tri === 'ancien';
  const reference = searchParams.reference?.trim().toUpperCase() || null;

  const commandes = await prisma.order.findMany({
    where: {
      ...(statutFiltre ? { status: statutFiltre } : {}),
      ...(reference ? { reference } : {}),
    },
    orderBy: { createdAt: ancienDabord ? 'asc' : 'desc' },
    include: { items: true },
    take: 200,
  });

  const lien = (parametres: Recherche) => {
    const query = new URLSearchParams();
    const fusion = { ...searchParams, ...parametres };
    for (const [cle, valeur] of Object.entries(fusion)) {
      if (valeur) query.set(cle, String(valeur));
    }
    const chaine = query.toString();
    return chaine ? `/admin/commandes?${chaine}` : '/admin/commandes';
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="surtitre">Commandes</p>
        <h1 className="mt-3 text-3xl">
          {statutFiltre ? LIBELLES_STATUT[statutFiltre] : 'Toutes les commandes'}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Lien href={lien({ statut: '' })} actif={!statutFiltre}>
          Toutes
        </Lien>
        {STATUTS.map((statut) => (
          <Lien key={statut} href={lien({ statut })} actif={statutFiltre === statut}>
            {LIBELLES_STATUT[statut]}
          </Lien>
        ))}

        <span className="ml-auto flex gap-2">
          <Lien href={lien({ tri: '' })} actif={!ancienDabord}>
            Plus récentes
          </Lien>
          <Lien href={lien({ tri: 'ancien' })} actif={ancienDabord}>
            Plus anciennes
          </Lien>
        </span>
      </div>

      {reference && (
        <p className="text-sm">
          Filtré sur la référence <span className="prix font-semibold">{reference}</span> —{' '}
          <Link href={lien({ reference: '' })} className="lien-souligne">
            afficher tout
          </Link>
        </p>
      )}

      {commandes.length === 0 ? (
        <p className="carte p-8 text-encre/65">Aucune commande ne correspond à ce filtre.</p>
      ) : (
        <ul className="space-y-4">
          {commandes.map((commande) => (
            <li key={commande.id} className="carte p-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <span className="prix text-lg font-bold">{commande.reference}</span>
                <span className="prix text-sm text-encre/60">
                  {dateHeureCourte(commande.createdAt)}
                </span>
                <span className="etiquette">
                  {commande.type === 'DELIVERY' ? 'Livraison' : 'À emporter'}
                </span>
                <span className="prix ml-auto text-lg font-bold">
                  {formatMillimes(commande.totalMillimes)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="text-sm">
                  <p className="font-semibold">{commande.customerName}</p>
                  <p className="prix">
                    <a href={`tel:${commande.phone.replace(/\s+/g, '')}`} className="lien-souligne">
                      {commande.phone}
                    </a>
                  </p>
                  {commande.type === 'DELIVERY' && (
                    <p className="mt-1 text-encre/70">
                      {commande.address}
                      {commande.city ? `, ${commande.city}` : ''}
                    </p>
                  )}
                  {commande.slot && (
                    <p className="mt-1 text-encre/70">Créneau : {commande.slot}</p>
                  )}
                  {commande.note && (
                    <p className="mt-2 border-l-2 border-citron pl-3 text-encre/80">
                      {commande.note}
                    </p>
                  )}
                </div>

                <div className="text-sm">
                  <ul className="space-y-1">
                    {commande.items.map((article) => (
                      <li key={article.id} className="flex justify-between gap-3">
                        <span>
                          <span className="prix text-encre/60">{article.quantity} ×</span>{' '}
                          {article.name}
                          <span className="prix ml-1 text-xs text-encre/45">
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
                  {commande.deliveryMillimes > 0 && (
                    <p className="mt-2 flex justify-between text-encre/70">
                      <span>Livraison</span>
                      <span className="prix">{formatMillimes(commande.deliveryMillimes)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-sel pt-4">
                <SelecteurStatut orderId={commande.id} statut={commande.status as Statut} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Lien({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={actif ? 'true' : undefined}
      className={`border px-3 py-2 text-xs font-semibold ${
        actif ? 'border-encre bg-encre text-chaux' : 'border-sel bg-white hover:border-vague'
      }`}
    >
      {children}
    </Link>
  );
}
