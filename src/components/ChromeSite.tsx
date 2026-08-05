'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * L'en-tête et le pied de page du site public ne doivent pas apparaître dans
 * le back-office, qui a sa propre navigation. Ce composant les masque sur
 * /admin sans dupliquer la mise en page racine.
 */
export default function ChromeSite({
  entete,
  pied,
  children,
}: {
  entete: ReactNode;
  pied: ReactNode;
  children: ReactNode;
}) {
  const chemin = usePathname();
  const dansAdmin = chemin.startsWith('/admin');

  return (
    <>
      {!dansAdmin && entete}
      <main id="contenu">{children}</main>
      {!dansAdmin && pied}
    </>
  );
}
