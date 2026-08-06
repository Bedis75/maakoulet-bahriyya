import { statutOuverture } from '@/lib/horaires';
import { aTelephone, adresseLigne, site, telHref } from '@/lib/site';

/**
 * Bandeau fin tout en haut du site : le restaurant est-il ouvert en ce moment ?
 * C'est la première question que se pose quelqu'un qui a faim.
 *
 * Le statut est calculé à chaque requête d'après site.hours, au fuseau de Tunis.
 * Sans horaires renseignés, la barre affiche seulement les coordonnées.
 */
export default function BarreStatut() {
  const statut = statutOuverture();
  const adresse = adresseLigne();

  if (statut.ouvert === null && !aTelephone() && !adresse) return null;

  return (
    <div className="border-b border-sel bg-white">
      <div className="conteneur flex h-9 items-center justify-between gap-4 text-[0.72rem]">
        {statut.ouvert !== null ? (
          <p className="flex items-center gap-2 whitespace-nowrap">
            <span
              aria-hidden="true"
              className={`inline-block h-[7px] w-[7px] rounded-full ${
                statut.ouvert ? 'bg-algue' : 'bg-harissa'
              }`}
            />
            <span className={`font-semibold ${statut.ouvert ? 'text-algue' : 'text-harissa'}`}>
              {statut.etat}
            </span>
            <span className="prix text-encre/50">{statut.precision}</span>
          </p>
        ) : (
          <span />
        )}

        <p className="hidden items-center gap-4 text-encre/55 sm:flex">
          {adresse && <span className="truncate">{adresse}</span>}
          {aTelephone() && (
            <a href={telHref()} className="prix whitespace-nowrap hover:text-port">
              {site.phone}
            </a>
          )}
        </p>
      </div>
    </div>
  );
}
