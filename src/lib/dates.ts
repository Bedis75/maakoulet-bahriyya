/**
 * La Tunisie est à UTC+1 toute l'année (pas d'heure d'été depuis 2009).
 * On s'appuie sur ce décalage fixe pour délimiter « la journée » côté serveur,
 * quel que soit le fuseau de la machine qui héberge le site.
 */
const FUSEAU = 'Africa/Tunis';
const DECALAGE = '+01:00';

/** Minuit à Tunis, exprimé en Date UTC. */
export function debutDeJournee(reference = new Date()): Date {
  const jour = new Intl.DateTimeFormat('fr-CA', {
    timeZone: FUSEAU,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(reference);
  return new Date(`${jour}T00:00:00${DECALAGE}`);
}

/** « mar. 5 août, 19:42 » */
export function dateHeureCourte(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** « 19:42 » */
export function heureCourte(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
