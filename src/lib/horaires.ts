import { aHoraires, JOURS_FR, site } from '@/lib/site';

/**
 * « Ouvert / Fermé » calculé à l'instant de la requête, d'après site.hours.
 * La Tunisie est à UTC+1 toute l'année : le fuseau Africa/Tunis suffit, sans
 * gestion d'heure d'été.
 *
 * Les pages étant rendues à la demande (`dynamic = 'force-dynamic'`), le statut
 * est toujours celui du moment où le visiteur charge la page.
 */

const FUSEAU = 'Africa/Tunis';

/** Ordre des codes de jours utilisés dans site.hours. */
const CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const ABREVIATIONS: Record<string, (typeof CODES)[number]> = {
  Sun: 'Su',
  Mon: 'Mo',
  Tue: 'Tu',
  Wed: 'We',
  Thu: 'Th',
  Fri: 'Fr',
  Sat: 'Sa',
};

export type StatutOuverture = {
  /** null = horaires non renseignés, ne rien afficher. */
  ouvert: boolean | null;
  /** « Ouvert » / « Fermé » */
  etat: string;
  /** « jusqu'à 15:00 », « ouvre à 18:30 », « ouvre mardi à 11:30 » */
  precision: string;
};

/** Minutes écoulées depuis minuit. */
function enMinutes(heure: string): number {
  const [h, m] = heure.split(':').map(Number);
  return h * 60 + m;
}

/** Jour et heure courants à Tunis, indépendamment du fuseau du serveur. */
function maintenantATunis(): { jour: number; minutes: number } {
  const parties = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSEAU,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const lire = (type: string) => parties.find((p) => p.type === type)?.value ?? '';
  const code = ABREVIATIONS[lire('weekday')] ?? 'Mo';

  return {
    jour: CODES.indexOf(code),
    minutes: Number(lire('hour')) * 60 + Number(lire('minute')),
  };
}

/** Plages horaires d'un jour donné, triées par heure d'ouverture. */
function plagesDuJour(jour: number) {
  const code = CODES[jour];
  return site.hours
    .filter((plage) => plage.days.includes(code))
    .map((plage) => ({ debut: enMinutes(plage.opens), fin: enMinutes(plage.closes), plage }))
    .sort((a, b) => a.debut - b.debut);
}

export function statutOuverture(): StatutOuverture {
  if (!aHoraires()) {
    return { ouvert: null, etat: '', precision: '' };
  }

  const { jour, minutes } = maintenantATunis();

  // 1. Une plage d'aujourd'hui est-elle en cours ?
  for (const { debut, fin, plage } of plagesDuJour(jour)) {
    const traverseMinuit = fin <= debut;
    const enCours = traverseMinuit
      ? minutes >= debut || minutes < fin
      : minutes >= debut && minutes < fin;

    if (enCours) {
      return { ouvert: true, etat: 'Ouvert', precision: `jusqu’à ${plage.closes}` };
    }
  }

  // 2. Sinon, la prochaine ouverture — aujourd'hui puis les jours suivants.
  for (let decalage = 0; decalage < 8; decalage += 1) {
    const jourVise = (jour + decalage) % 7;
    for (const { debut, plage } of plagesDuJour(jourVise)) {
      if (decalage === 0 && debut <= minutes) continue;

      if (decalage === 0) {
        return { ouvert: false, etat: 'Fermé', precision: `ouvre à ${plage.opens}` };
      }
      if (decalage === 1) {
        return { ouvert: false, etat: 'Fermé', precision: `ouvre demain à ${plage.opens}` };
      }
      const nomDuJour = JOURS_FR[CODES[jourVise]] ?? '';
      return {
        ouvert: false,
        etat: 'Fermé',
        precision: `ouvre ${nomDuJour.toLowerCase()} à ${plage.opens}`,
      };
    }
  }

  return { ouvert: false, etat: 'Fermé', precision: '' };
}
