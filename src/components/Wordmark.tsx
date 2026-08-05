import Image from 'next/image';

import { site } from '@/lib/site';

type Props = {
  /** Taille du logotype selon l'emplacement. */
  taille?: 'entete' | 'pied' | 'grand';
  /** Affiche « Poissons & fruits de mer » sous le nom. */
  sousTitre?: boolean;
  /** Texte clair sur fond sombre. */
  clair?: boolean;
};

const TAILLES = {
  entete: 'text-[1.6rem] sm:text-[1.9rem]',
  pied: 'text-[1.5rem]',
  grand: 'text-[clamp(2rem,5vw,3.25rem)]',
} as const;

/**
 * Le logotype du site : l'enseigne s'affiche en arabe, c'est le logo.
 * Seul cet élément est en RTL — le document reste lang="fr" dir="ltr".
 * Si le client fournit un vrai logo, il suffit de renseigner `site.logo`.
 */
export default function Wordmark({ taille = 'entete', sousTitre = false, clair = false }: Props) {
  const alt = `${site.nameFr} — poissons et fruits de mer`;

  if (site.logo) {
    return (
      <Image
        src={site.logo.src}
        alt={alt}
        width={site.logo.width}
        height={site.logo.height}
        priority={taille !== 'pied'}
        className="h-auto w-auto max-h-14"
      />
    );
  }

  return (
    <span className="inline-flex flex-col leading-none" aria-label={alt}>
      <span
        lang="ar"
        dir="rtl"
        aria-hidden="true"
        className={`logotype-ar ${TAILLES[taille]} ${clair ? 'text-chaux' : 'text-encre'}`}
      >
        {site.nameAr}
      </span>
      {sousTitre && (
        <span
          className={`mt-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] ${
            clair ? 'text-sel/80' : 'text-port'
          }`}
        >
          {site.tagline}
        </span>
      )}
    </span>
  );
}
