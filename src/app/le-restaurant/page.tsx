import type { Metadata } from 'next';
import Link from 'next/link';

import DishImage from '@/components/DishImage';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/Reveal';
import { contenu } from '@/lib/contenu';
import { construireMetadata, jsonLdFilAriane } from '@/lib/seo';
import { aTelephone, DONNEES_DEMONSTRATION, telHref, ville } from '@/lib/site';

const v = ville();

export const metadata: Metadata = construireMetadata({
  titre: v ? `Le restaurant — poisson frais à ${v}` : 'Le restaurant',
  description: v
    ? `Notre histoire, la provenance du poisson et la façon dont nous cuisinons, à ${v}.`
    : 'Notre histoire, la provenance du poisson et la façon dont nous cuisinons.',
  chemin: '/le-restaurant',
});

/**
 * Les textes viennent de src/lib/contenu.ts et sont marqués « provisoire »
 * tant qu'ils n'ont pas été écrits avec le client. La mention est visible :
 * personne ne peut confondre un texte de structure avec le texte définitif.
 */
export default function PageRestaurant() {
  return (
    <div className="conteneur py-14">
      <JsonLd donnees={jsonLdFilAriane([{ nom: 'Le restaurant', chemin: '/le-restaurant' }])} />

      <p className="surtitre">Le restaurant</p>
      <h1 className="mt-4 max-w-4xl">Du port à l’assiette{v ? `, à ${v}` : ''}</h1>
      <p className="mt-6 max-w-lecture text-lg text-encre/75">
        Un restaurant de poissons et de fruits de mer : ce qui arrive le matin est ce qui se mange
        le midi. Rien de congelé, rien qui attend.
      </p>

      <div className="mt-16 space-y-20">
        {contenu.restaurant.map((section, index) => (
          <Reveal
            key={section.titre}
            className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
              index % 2 === 1 ? 'lg:[&>figure]:order-first' : ''
            }`}
          >
            <div>
              <h2>{section.titre}</h2>
              {section.provisoire && (
                <p className="mt-3 inline-block border border-citron bg-citron/10 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.1em]">
                  Texte provisoire — à écrire avec le restaurant
                </p>
              )}
              <div className="mt-4 space-y-4 text-encre/75">
                {section.paragraphes.map((paragraphe) => (
                  <p key={paragraphe} className="max-w-lecture">
                    {paragraphe}
                  </p>
                ))}
              </div>
            </div>

            <figure className="m-0">
              <DishImage
                nom={section.titre}
                categorie={index % 2 === 0 ? 'poissons-grilles' : 'fruits-de-mer'}
                className="aspect-[4/3] w-full border border-sel"
              />
              {!DONNEES_DEMONSTRATION && (
                <figcaption className="mt-2 text-xs text-encre/50">
                  Emplacement réservé à une photo du restaurant.
                </figcaption>
              )}
            </figure>
          </Reveal>
        ))}
      </div>

      <section aria-labelledby="titre-galerie" className="mt-24">
        <h2 id="titre-galerie">La galerie</h2>
        <p className="mt-3 max-w-lecture text-encre/70">
          {DONNEES_DEMONSTRATION
            ? 'La façade, la salle, le grill et l’étal du matin.'
            : 'Les photos de la salle, de la façade et des plats prendront place ici. En attendant, les emplacements sont réservés — c’est le poste le plus important pour un site de restaurant.'}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['La façade', 'La salle', 'Le grill', 'L’étal', 'Le service', 'L’équipe'].map((legende) => (
            <li key={legende}>
              <DishImage
                nom={legende}
                categorie={legende.length % 2 === 0 ? 'entrees' : 'plats'}
                className="aspect-square w-full border border-sel"
              />
              <p className="mt-2 text-xs text-encre/50">{legende}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-20 flex flex-wrap gap-3 border-t border-sel pt-10">
        <Link href="/carte" className="bouton bouton-action">
          Voir la carte
        </Link>
        {aTelephone() && (
          <a href={telHref()} className="bouton bouton-secondaire">
            Appeler le restaurant
          </a>
        )}
      </div>
    </div>
  );
}
