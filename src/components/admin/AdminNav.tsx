'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LIENS = [
  { href: '/admin', libelle: 'Tableau de bord', exact: true },
  { href: '/admin/commandes', libelle: 'Commandes', exact: false },
  { href: '/admin/carte', libelle: 'La carte', exact: false },
  { href: '/admin/reglages', libelle: 'Réglages', exact: false },
];

/** Navigation du back-office. Pensée pour un pouce, debout en cuisine. */
export default function AdminNav() {
  const chemin = usePathname();

  return (
    <nav aria-label="Navigation du back-office" className="border-b border-chaux/15 bg-encre">
      <ul className="conteneur flex gap-1 overflow-x-auto py-2">
        {LIENS.map((lien) => {
          const actif = lien.exact ? chemin === lien.href : chemin.startsWith(lien.href);
          return (
            <li key={lien.href}>
              <Link
                href={lien.href}
                aria-current={actif ? 'page' : undefined}
                className={`flex min-h-[44px] items-center whitespace-nowrap px-4 text-sm font-semibold ${
                  actif ? 'bg-chaux text-encre' : 'text-sel/80 hover:bg-chaux/10 hover:text-chaux'
                }`}
              >
                {lien.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
