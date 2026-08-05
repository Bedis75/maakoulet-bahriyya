import type { Metadata } from 'next';

import ContactForm from '@/app/contact/ContactForm';
import JsonLd from '@/components/JsonLd';
import { construireMetadata, jsonLdFilAriane } from '@/lib/seo';
import { getReglages, listeZones } from '@/lib/settings';
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
  whatsappHref,
} from '@/lib/site';

const v = ville();

export const metadata: Metadata = construireMetadata({
  titre: v ? `Contact — restaurant de poisson à ${v}` : 'Contact',
  description: v
    ? `Adresse, téléphone, horaires et itinéraire du restaurant de poissons et fruits de mer à ${v}.`
    : 'Adresse, téléphone, horaires et itinéraire du restaurant de poissons et fruits de mer.',
  chemin: '/contact',
});

export default async function PageContact() {
  const reglages = await getReglages();
  const zones = listeZones(reglages.deliveryZones);
  const adresse = adresseLigne();

  return (
    <div className="conteneur py-14">
      <JsonLd donnees={jsonLdFilAriane([{ nom: 'Contact', chemin: '/contact' }])} />

      <p className="surtitre">Contact</p>
      <h1 className="mt-4">Nous joindre</h1>
      <p className="mt-6 max-w-lecture text-lg text-encre/75">
        Le plus simple reste le téléphone : nous répondons pendant le service.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <dl className="space-y-6">
            {adresse && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">Adresse</dt>
                <dd className="mt-1">{adresse}</dd>
              </div>
            )}

            {aTelephone() && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">
                  Téléphone
                </dt>
                <dd className="prix mt-1 text-lg">
                  <a href={telHref()} className="lien-souligne">
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}

            {whatsappHref() && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">WhatsApp</dt>
                <dd className="mt-1">
                  <a
                    href={whatsappHref() as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lien-souligne"
                  >
                    Écrire sur WhatsApp
                  </a>
                </dd>
              </div>
            )}

            {estRenseigne(site.email) && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">E-mail</dt>
                <dd className="mt-1">
                  <a href={`mailto:${site.email}`} className="lien-souligne">
                    {site.email}
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

            {zones.length > 0 && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-port">
                  Zones livrées
                </dt>
                <dd className="mt-1">{zones.join(' · ')}</dd>
              </div>
            )}
          </dl>

          {estRenseigne(site.googleMapsUrl) && (
            <a
              href={site.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton bouton-secondaire"
            >
              Ouvrir l’itinéraire
            </a>
          )}

          <div className="min-h-[300px] border border-sel bg-white">
            {aGeo() ? (
              <iframe
                title={`Plan d’accès${v ? ` — ${v}` : ''}`}
                src={`https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&hl=fr&z=16&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[300px] w-full"
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center p-8 text-center text-sm text-encre/60">
                Le plan d’accès sera affiché ici dès que l’emplacement exact sera confirmé.
              </div>
            )}
          </div>
        </div>

        <ContactForm
          email={estRenseigne(site.email) ? site.email : null}
          whatsapp={whatsappHref()}
          telephone={aTelephone() ? site.phone : null}
        />
      </div>
    </div>
  );
}
