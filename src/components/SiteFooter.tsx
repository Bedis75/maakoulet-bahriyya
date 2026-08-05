import Link from 'next/link';

import Wordmark from '@/components/Wordmark';
import {
  aAdresse,
  aHoraires,
  aTelephone,
  adresseLigne,
  estRenseigne,
  JOURS_FR,
  site,
  telHref,
  ville,
} from '@/lib/site';

/**
 * Tout ce qui s'affiche ici vient de src/lib/site.ts. Les champs non confirmés
 * sont simplement masqués : jamais de « À CONFIRMER » devant un visiteur.
 */
export default function SiteFooter() {
  const adresse = adresseLigne();
  const v = ville();

  return (
    <footer className="mt-24 bg-encre text-chaux">
      <div className="conteneur grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark taille="pied" sousTitre clair />
          <p className="mt-4 max-w-xs text-sm text-sel/75">
            Poissons et fruits de mer{v ? ` à ${v}` : ''} : arrivage du jour, grillades à la minute,
            livraison et vente à emporter.
          </p>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-citron">Nous trouver</h2>
          <address className="mt-4 space-y-2 text-sm not-italic text-sel/85">
            {adresse && <p>{adresse}</p>}
            {aTelephone() && (
              <p>
                <a href={telHref()} className="prix hover:text-citron">
                  {site.phone}
                </a>
              </p>
            )}
            {estRenseigne(site.email) && (
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-citron">
                  {site.email}
                </a>
              </p>
            )}
            {estRenseigne(site.googleMapsUrl) && (
              <p>
                <a
                  href={site.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-citron"
                >
                  Itinéraire
                </a>
              </p>
            )}
            {!adresse && !aTelephone() && (
              <p className="text-sel/60">Coordonnées à venir.</p>
            )}
          </address>
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-citron">Horaires</h2>
          {aHoraires() ? (
            <ul className="mt-4 space-y-1 text-sm text-sel/85">
              {site.hours.map((plage, index) => (
                <li key={index} className="flex flex-wrap gap-x-2">
                  <span>{plage.days.map((j) => JOURS_FR[j] ?? j).join(', ')}</span>
                  <span className="prix">
                    {plage.opens} – {plage.closes}
                  </span>
                </li>
              ))}
              {estRenseigne(site.closedDays) && (
                <li className="pt-2 text-sel/60">Fermé : {site.closedDays}</li>
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-sel/60">Horaires à venir.</p>
          )}
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-citron">Le site</h2>
          <ul className="mt-4 space-y-2 text-sm text-sel/85">
            <li>
              <Link href="/carte" className="hover:text-citron">
                La carte
              </Link>
            </li>
            <li>
              <Link href="/le-restaurant" className="hover:text-citron">
                Le restaurant
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-citron">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/panier" className="hover:text-citron">
                Mon panier
              </Link>
            </li>
          </ul>

          {(estRenseigne(site.social.facebook) || estRenseigne(site.social.instagram)) && (
            <ul className="mt-5 flex gap-4 text-sm">
              {estRenseigne(site.social.facebook) && (
                <li>
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-citron"
                  >
                    Facebook
                  </a>
                </li>
              )}
              {estRenseigne(site.social.instagram) && (
                <li>
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-citron"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-chaux/15">
        <div className="conteneur flex flex-col gap-2 py-5 text-xs text-sel/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {estRenseigne(site.legalName) ? site.legalName : site.nameFr}
            {aAdresse() ? ` — ${site.address.city}` : ''}. Tous droits réservés.
          </p>
          <p>Paiement à la livraison. Commandes par le site ou par téléphone.</p>
        </div>
      </div>
    </footer>
  );
}
