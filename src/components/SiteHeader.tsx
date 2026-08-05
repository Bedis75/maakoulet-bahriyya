'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { usePanier } from '@/components/CartProvider';
import Wordmark from '@/components/Wordmark';

const LIENS = [
  { href: '/carte', libelle: 'La carte' },
  { href: '/le-restaurant', libelle: 'Le restaurant' },
  { href: '/contact', libelle: 'Contact' },
];

export default function SiteHeader() {
  const chemin = usePathname();
  const { nbArticles, ouvrirTiroir, charge } = usePanier();
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Le menu mobile se referme à chaque changement de page.
  useEffect(() => {
    setMenuOuvert(false);
  }, [chemin]);

  return (
    <header className="sticky top-0 z-40 border-b border-sel bg-chaux/95 backdrop-blur">
      <div className="conteneur flex h-[72px] items-center justify-between gap-2 sm:gap-4">
        {/* Le sous-titre est masqué sous 640px : avec lui, le logotype (shrink-0),
            le panier et le menu dépassent la largeur utile d'un écran de 360px. */}
        <Link href="/" className="min-w-0 shrink-0" aria-label="Accueil">
          <Wordmark taille="entete" sousTitre sousTitreDesMobile={false} />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
          {LIENS.map((lien) => {
            const actif = chemin === lien.href || chemin.startsWith(`${lien.href}/`);
            return (
              <Link
                key={lien.href}
                href={lien.href}
                aria-current={actif ? 'page' : undefined}
                className={`text-sm font-semibold transition-colors ${
                  actif ? 'text-port underline underline-offset-8' : 'text-encre hover:text-port'
                }`}
              >
                {lien.libelle}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={ouvrirTiroir}
            className="relative flex h-11 items-center gap-2 border border-encre px-3 text-sm font-semibold hover:bg-encre hover:text-chaux"
            aria-label={`Ouvrir le panier${charge && nbArticles > 0 ? ` (${nbArticles} article${nbArticles > 1 ? 's' : ''})` : ''}`}
          >
            <span aria-hidden="true">Panier</span>
            {charge && nbArticles > 0 && (
              <span className="prix flex h-5 min-w-5 items-center justify-center bg-citron px-1 text-[0.7rem] font-bold text-encre">
                {nbArticles}
              </span>
            )}
          </button>

          <Link href="/carte" className="bouton bouton-action hidden sm:inline-flex">
            Commander
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-encre md:hidden"
            aria-expanded={menuOuvert}
            aria-controls="menu-mobile"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true" className="text-xl leading-none">
              {menuOuvert ? '×' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {menuOuvert && (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="border-t border-sel md:hidden">
          <ul className="conteneur flex flex-col py-2">
            {LIENS.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="block border-b border-sel py-3 font-semibold last:border-b-0"
                >
                  {lien.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
