import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getCreditsPhotos } from '@/lib/credits';
import { construireMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...construireMetadata({
    titre: 'Crédits photographiques',
    description: 'Auteurs et licences des photographies utilisées sur le site.',
    chemin: '/credits-photos',
  }),
  robots: { index: false, follow: true },
};

/**
 * Attribution des photos de démonstration.
 * Les licences CC BY et CC BY-SA imposent de créditer l'auteur et de nommer la
 * licence là où l'œuvre est diffusée : cette page remplit cette obligation.
 * Elle disparaît d'elle-même quand les vraies photos du restaurant remplacent
 * les provisoires (`npm run photos:purge`).
 */
export default function PageCredits() {
  const credits = getCreditsPhotos();
  if (credits.length === 0) notFound();

  return (
    <div className="conteneur max-w-4xl py-14">
      <p className="surtitre">Mentions</p>
      <h1 className="mt-4">Crédits photographiques</h1>

      <p className="mt-6 max-w-lecture text-lg text-encre/75">
        Les photographies actuellement affichées sur ce site sont{' '}
        <strong>provisoires</strong>. Elles proviennent de Wikimedia Commons, sous licence
        autorisant la réutilisation, et <strong>ne montrent pas les plats du restaurant</strong> :
        elles servent uniquement à présenter la mise en page en attendant les photographies
        définitives.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Liste des photographies, de leurs auteurs et de leurs licences
          </caption>
          <thead>
            <tr className="border-b border-encre text-left">
              <th scope="col" className="py-3 pr-4 font-semibold">
                Plat
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold">
                Photographie
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold">
                Auteur
              </th>
              <th scope="col" className="py-3 font-semibold">
                Licence
              </th>
            </tr>
          </thead>
          <tbody>
            {credits.map((credit) => (
              <tr key={credit.fichier} className="border-b border-sel align-top">
                <td className="py-3 pr-4">{credit.plat}</td>
                <td className="py-3 pr-4">
                  <a
                    href={credit.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lien-souligne"
                  >
                    {credit.titre}
                  </a>
                </td>
                <td className="py-3 pr-4 text-encre/75">{credit.auteur}</td>
                <td className="prix py-3 whitespace-nowrap text-encre/75">{credit.licence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-10 text-sm text-encre/60">
        Photographies hébergées par{' '}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="lien-souligne"
        >
          Wikimedia Commons
        </a>
        . Le détail de chaque licence est accessible depuis la page de la photographie.
      </p>

      <Link href="/carte" className="bouton bouton-secondaire mt-8">
        Retour à la carte
      </Link>
    </div>
  );
}
