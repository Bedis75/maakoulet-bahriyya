/**
 * Tous les montants sont stockés en millimes (entiers). 1 DT = 1000 millimes.
 * Aucun flottant ne doit circuler : ni en base, ni dans les calculs.
 */

const ESPACE_FINE = ' '; // espace insécable étroite, séparateur de milliers

/** 92000 → « 92,000 DT » · 1500000 → « 1 500,000 DT » */
export function formatMillimes(millimes: number, options?: { suffixe?: string }): string {
  const suffixe = options?.suffixe ?? ' DT';
  const negatif = millimes < 0;
  const valeur = Math.abs(Math.round(millimes));
  const dinars = Math.floor(valeur / 1000);
  const reste = String(valeur % 1000).padStart(3, '0');
  const dinarsFormates = String(dinars).replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE_FINE);
  return `${negatif ? '−' : ''}${dinarsFormates},${reste}${suffixe}`;
}

/** Suffixe d'unité affiché à côté du prix. */
export function suffixeUnite(unit: string): string {
  switch (unit) {
    case 'KG':
      return ' / kg';
    case 'PORTION':
      return ' / part';
    default:
      return '';
  }
}

/** Libellé long d'une unité, pour les formulaires d'administration. */
export function libelleUnite(unit: string): string {
  switch (unit) {
    case 'KG':
      return 'Au kilo';
    case 'PORTION':
      return 'À la portion';
    default:
      return 'À la pièce';
  }
}

export const UNITES = ['PIECE', 'KG', 'PORTION'] as const;

/** « 92,000 DT / kg » — prix complet d'un produit. */
export function prixAvecUnite(millimes: number, unit: string): string {
  return `${formatMillimes(millimes)}${suffixeUnite(unit)}`;
}

/**
 * Convertit une saisie utilisateur en millimes.
 * Accepte « 92 », « 92,5 », « 92.500 », « 92,500 ». Retourne null si invalide.
 * Le back-office saisit des dinars ; la base ne connaît que les millimes.
 */
export function dinarsVersMillimes(saisie: string): number | null {
  const nettoye = saisie.replace(/\s/g, '').replace(',', '.');
  if (nettoye === '') return null;
  if (!/^\d+(\.\d{0,3})?$/.test(nettoye)) return null;
  const [entier, decimal = ''] = nettoye.split('.');
  const millimes = Number(entier) * 1000 + Number(decimal.padEnd(3, '0'));
  return Number.isSafeInteger(millimes) ? millimes : null;
}

/** 92000 → « 92.500 » : valeur pré-remplie dans un champ de saisie. */
export function millimesVersSaisie(millimes: number): string {
  const dinars = Math.floor(millimes / 1000);
  const reste = String(millimes % 1000).padStart(3, '0');
  return `${dinars}.${reste}`;
}
