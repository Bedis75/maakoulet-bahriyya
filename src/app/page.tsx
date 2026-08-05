import Link from 'next/link';

import Ardoise from '@/components/Ardoise';
import DishImage from '@/components/DishImage';
import Reveal from '@/components/Reveal';
import { contenu } from '@/lib/contenu';
import { prixAvecUnite } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import {
  aGeo,
  aHoraires,
  aTelephone,
  adresseLigne,
  estRenseigne,
  JOURS_FR,
  site,
  telHref,
  ville,
} from '@/lib/site';

export default async function PageAccueil() {
  const v = ville();
  const adresse = adresseLigne();

  const categories = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        take: 3,
      },
    },
  });
  const categoriesNonVides = categories.filter((categorie) => categorie.products.length > 0);

  return (
    <>
      {/* ------------------------------------------------------------ Héro */}
      <section className="conteneur grid gap-10 pb-16 pt-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:pt-16">
        <div>
          <p className="surtitre">Poissons &amp; fruits de mer{v ? ` · ${v}` : ''}</p>
          <h1 className="mt-4">
            Le poisson du jour,
            <br />
            grillé à la minute
            {v && (
              <>
                {' '}
                <span className="text-port">à {v}</span>
              </>
            )}
            .
          </h1>
          <p className="mt-6 max-w-lecture text-lg text-encre/75">
            Ce qui arrive du port le matin est sur l’ardoise à midi. Vous choisissez, on pèse, on
            grille. À emporter ou livré{v ? ` à ${v} et alentours` : ''}.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/carte" className="bouton bouton-action">
              Voir la carte et commander
            </Link>
            {aTelephone() && (
              <a href={telHref()} className="bouton bouton-secondaire">
                Appeler le restaurant
              </a>
            )}
          </div>
        </div>

        {/* L'ardoise : élément signature, alimentée en direct par la base. */}
        <Ardoise />
      </section>

      {/* ------------------------------------------------- Trois arguments */}
      <section aria-labelledby="titre-arguments" className="border-y border-sel bg-white">
        <h2 id="titre-arguments" className="sr-only">
          Ce qui nous distingue
        </h2>
        <div className="conteneur grid gap-px bg-sel sm:grid-cols-3">
          {contenu.arguments.map((argument, index) => (
            <Reveal
              key={argument.titre}
              delai={index * 80}
              className="bg-white px-6 py-10 sm:px-8"
            >
              <p className="prix text-xs text-citron">0{index + 1}</p>
              <h3 className="mt-3">{argument.titre}</h3>
              <p className="mt-3 text-encre/75">{argument.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Aperçu de la carte */}
      <section aria-labelledby="titre-carte" className="conteneur py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="surtitre">La carte</p>
            <h2 id="titre-carte" className="mt-3">
              Un aperçu de ce qu’on sert
            </h2>
          </div>
          <Link href="/carte" className="lien-souligne font-semibold">
            Voir toute la carte
          </Link>
        </div>

        {categoriesNonVides.length === 0 ? (
          <p className="mt-10 text-encre/70">La carte sera publiée très prochainement.</p>
        ) : (
          <div className="mt-10 space-y-14">
            {categoriesNonVides.slice(0, 4).map((categorie) => (
              <Reveal key={categorie.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-sel pb-3">
                  <h3>{categorie.name}</h3>
                  <Link
                    href={`/carte#${categorie.slug}`}
                    className="text-sm font-semibold text-port hover:text-vague"
                  >
                    Tout voir
                  </Link>
                </div>

                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {categorie.products.map((produit) => (
                    <li key={produit.id} className="carte flex flex-col overflow-hidden">
                      <DishImage
                        imageUrl={produit.imageUrl}
                        nom={produit.name}
                        categorie={categorie.slug}
                        className="aspect-[4/3] w-full"
                      />
                      <div className="flex flex-1 flex-col p-4">
                        <h4 className="font-titre text-lg font-bold">{produit.name}</h4>
                        {produit.description && (
                          <p className="mt-2 line-clamp-3 text-sm text-encre/70">
                            {produit.description}
                          </p>
                        )}
                        <p className="prix mt-4 font-semibold">
                          {prixAvecUnite(produit.priceMillimes, produit.unit)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------- Horaires + itinéraire */}
      <section aria-labelledby="titre-venir" className="border-y border-sel bg-white py-20">
        <div className="conteneur grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="surtitre">Nous trouver</p>
            <h2 id="titre-venir" className="mt-3">
              Passer nous voir{v ? ` à ${v}` : ''}
            </h2>

            <dl className="mt-8 space-y-6">
              {adresse && (
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">
                    Adresse
                  </dt>
                  <dd className="mt-1">{adresse}</dd>
                </div>
              )}

              {aTelephone() && (
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">
                    Téléphone
                  </dt>
                  <dd className="prix mt-1">
                    <a href={telHref()} className="lien-souligne">
                      {site.phone}
                    </a>
                  </dd>
                </div>
              )}

              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">Horaires</dt>
                <dd className="mt-1">
                  {aHoraires() ? (
                    <ul className="space-y-1">
                      {site.hours.map((plage, index) => (
                        <li key={index} className="flex flex-wrap gap-x-3">
                          <span>{plage.days.map((j) => JOURS_FR[j] ?? j).join(', ')}</span>
                          <span className="prix">
                            {plage.opens} – {plage.closes}
                          </span>
                        </li>
                      ))}
                      {estRenseigne(site.closedDays) && (
                        <li className="text-encre/60">Fermé : {site.closedDays}</li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-encre/60">Horaires communiqués très prochainement.</span>
                  )}
                </dd>
              </div>
            </dl>

            {estRenseigne(site.googleMapsUrl) && (
              <a
                href={site.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bouton bouton-secondaire mt-8"
              >
                Itinéraire
              </a>
            )}
          </div>

          <div className="min-h-[320px] border border-sel bg-chaux">
            {aGeo() ? (
              <iframe
                title={`Emplacement du restaurant${v ? ` à ${v}` : ''}`}
                src={`https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&hl=fr&z=16&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[320px] w-full"
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center p-8 text-center text-sm text-encre/60">
                Le plan d’accès sera affiché ici dès que l’emplacement exact sera confirmé.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Avis clients */}
      <section aria-labelledby="titre-avis" className="conteneur py-20">
        <p className="surtitre">Ils sont venus</p>
        <h2 id="titre-avis" className="mt-3">
          Avis des clients
        </h2>

        {contenu.avis.length > 0 ? (
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {contenu.avis.map((avis) => (
              <li key={avis.auteur} className="carte p-6">
                <blockquote className="text-encre/85">« {avis.texte} »</blockquote>
                <p className="prix mt-4 text-xs uppercase tracking-[0.1em] text-port">
                  {avis.auteur}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="carte mt-10 p-8">
            <p className="max-w-lecture text-encre/75">
              Les avis de nos clients seront publiés ici. Nous préférons attendre les vrais plutôt
              que d’en inventer.
            </p>
            {estRenseigne(site.googleMapsUrl) && (
              <a
                href={site.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lien-souligne mt-4 inline-block font-semibold"
              >
                Lire et laisser un avis sur Google
              </a>
            )}
          </div>
        )}
      </section>
    </>
  );
}
