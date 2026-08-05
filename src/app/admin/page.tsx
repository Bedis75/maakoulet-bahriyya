import Link from 'next/link';

import { SEUIL_STOCK_BAS } from '@/lib/catalogue';
import { exigerSession } from '@/lib/auth';
import { debutDeJournee, heureCourte } from '@/lib/dates';
import { formatMillimes } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { getReglages } from '@/lib/settings';
import { LIBELLES_STATUT, type Statut } from '@/lib/validation';

export default async function PageTableauDeBord() {
  const session = await exigerSession();
  const depuis = debutDeJournee();

  const [commandesDuJour, aTraiter, stockBas, epuises, reglages] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: depuis } },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.count({ where: { status: { in: ['NEW', 'CONFIRMED', 'PREPARING'] } } }),
    prisma.product.findMany({
      where: { stock: { lte: SEUIL_STOCK_BAS, gt: 0 }, isAvailable: true },
      orderBy: { stock: 'asc' },
      select: { id: true, name: true, stock: true },
    }),
    prisma.product.findMany({
      where: { OR: [{ isAvailable: false }, { stock: { lte: 0 } }] },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isAvailable: true, stock: true },
    }),
    getReglages(),
  ]);

  const encaisse = commandesDuJour
    .filter((commande) => commande.status !== 'CANCELLED')
    .reduce((total, commande) => total + commande.totalMillimes, 0);

  return (
    <div className="space-y-10">
      <div>
        <p className="surtitre">Tableau de bord</p>
        <h1 className="mt-3 text-3xl">Bonjour {session.name}</h1>
      </div>

      {!reglages.isOpenForOrders && (
        <p className="border border-harissa bg-harissa/5 p-4 text-sm text-harissa">
          Les commandes en ligne sont <strong>fermées</strong>. Les visiteurs peuvent consulter la
          carte mais pas commander.{' '}
          <Link href="/admin/reglages" className="underline underline-offset-2">
            Rouvrir les commandes
          </Link>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tuile titre="Commandes aujourd’hui" valeur={String(commandesDuJour.length)} />
        <Tuile titre="Chiffre du jour" valeur={formatMillimes(encaisse)} accent />
        <Tuile titre="À traiter" valeur={String(aTraiter)} lien="/admin/commandes" />
        <Tuile
          titre="Alertes carte"
          valeur={String(stockBas.length + epuises.length)}
          lien="/admin/carte"
        />
      </div>

      <section aria-labelledby="titre-commandes-jour">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="titre-commandes-jour" className="text-xl">
            Commandes du jour
          </h2>
          <Link href="/admin/commandes" className="text-sm font-semibold text-port hover:text-vague">
            Toutes les commandes
          </Link>
        </div>

        {commandesDuJour.length === 0 ? (
          <p className="carte mt-4 p-6 text-encre/65">Aucune commande depuis ce matin.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {commandesDuJour.map((commande) => (
              <li key={commande.id}>
                <Link
                  href={`/admin/commandes?reference=${commande.reference}`}
                  className="carte flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:border-vague"
                >
                  <span className="prix font-semibold">{commande.reference}</span>
                  <span className="prix text-sm text-encre/60">
                    {heureCourte(commande.createdAt)}
                  </span>
                  <span className="text-sm">{commande.customerName}</span>
                  <span className="etiquette">
                    {commande.type === 'DELIVERY' ? 'Livraison' : 'À emporter'}
                  </span>
                  <span className="text-sm text-encre/60">
                    {commande.items.length} article{commande.items.length > 1 ? 's' : ''}
                  </span>
                  <span className="prix ml-auto font-semibold">
                    {formatMillimes(commande.totalMillimes)}
                  </span>
                  <span
                    className={`etiquette ${
                      commande.status === 'CANCELLED'
                        ? 'etiquette-epuise'
                        : commande.status === 'COMPLETED'
                          ? 'etiquette-dispo'
                          : ''
                    }`}
                  >
                    {LIBELLES_STATUT[commande.status as Statut] ?? commande.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="titre-stock-bas">
          <h2 id="titre-stock-bas" className="text-xl">
            Stock bas (≤ {SEUIL_STOCK_BAS})
          </h2>
          {stockBas.length === 0 ? (
            <p className="carte mt-4 p-6 text-encre/65">Rien en alerte.</p>
          ) : (
            <ul className="carte mt-4 divide-y divide-sel">
              {stockBas.map((produit) => (
                <li key={produit.id} className="flex items-center justify-between p-4">
                  <span>{produit.name}</span>
                  <span className="prix text-citron">reste {produit.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titre-epuises">
          <h2 id="titre-epuises" className="text-xl">
            Plats épuisés
          </h2>
          {epuises.length === 0 ? (
            <p className="carte mt-4 p-6 text-encre/65">Tout est disponible.</p>
          ) : (
            <ul className="carte mt-4 divide-y divide-sel">
              {epuises.map((produit) => (
                <li key={produit.id} className="flex items-center justify-between p-4">
                  <span>{produit.name}</span>
                  <span className="prix text-harissa">
                    {produit.isAvailable ? 'stock 0' : 'désactivé'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-sm text-encre/60">
        Pour changer un prix ou remettre un plat en vente :{' '}
        <Link href="/admin/carte" className="lien-souligne font-semibold">
          gérer la carte
        </Link>
        .
      </p>
    </div>
  );
}

function Tuile({
  titre,
  valeur,
  lien,
  accent = false,
}: {
  titre: string;
  valeur: string;
  lien?: string;
  accent?: boolean;
}) {
  const contenu = (
    <div className={`carte h-full p-5 ${lien ? 'hover:border-vague' : ''}`}>
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-port">{titre}</p>
      <p className={`prix mt-2 text-2xl font-bold ${accent ? 'text-encre' : ''}`}>{valeur}</p>
    </div>
  );

  return lien ? <Link href={lien}>{contenu}</Link> : contenu;
}
