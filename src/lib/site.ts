/**
 * ---------------------------------------------------------------------------
 *  LE FICHIER À MODIFIER quand le client fournit ses informations.
 * ---------------------------------------------------------------------------
 *  Tout ce qui identifie le restaurant vient d'ici : en-tête, pied de page,
 *  page contact, métadonnées, JSON-LD, sitemap. Rien n'est écrit en double
 *  ailleurs dans le code.
 * ---------------------------------------------------------------------------
 *  ⚠ MODE DÉMONSTRATION ACTIVÉ — voir DONNEES-A-OBTENIR.md
 *
 *  Les coordonnées affichées sur le site sont FICTIVES. Elles servent à montrer
 *  le site complet lors d'une présentation, en attendant les vraies.
 *
 *  Passer DONNEES_DEMONSTRATION à false rétablit les marqueurs « À CONFIRMER » :
 *  chaque composant masque alors proprement ce qui n'est pas renseigné, et rien
 *  d'inventé n'est visible par un visiteur.
 * ---------------------------------------------------------------------------
 */

/** true = coordonnées fictives · false = uniquement les valeurs réelles. */
export const DONNEES_DEMONSTRATION = true;

export const A_CONFIRMER = 'À CONFIRMER';

type Identite = {
  legalName: string;
  description: string;
  address: { street: string; city: string; postalCode: string; country: string };
  geo: { lat: number; lng: number };
  googleMapsUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: { days: string[]; opens: string; closes: string }[];
  closedDays: string;
  social: { facebook: string; instagram: string };
};

/**
 * VALEURS FICTIVES — aucune ne vient du restaurant.
 * Le numéro de téléphone se termine par une partie abonné en 000 000, non
 * attribuable : il ne sonne chez personne. Les coordonnées GPS pointent sur le
 * port de Sousse, lieu public. Les comptes sociaux n'existent pas.
 */
const DEMO: Identite = {
  legalName: 'Maakoulet Bahriyya SARL',
  description:
    'Restaurant de poissons et fruits de mer à Sousse : arrivage quotidien du port, grillades à la minute, livraison et vente à emporter.',
  address: {
    street: 'Avenue Hédi Chaker, face au port de pêche',
    city: 'Sousse',
    postalCode: '4000',
    country: 'TN',
  },
  geo: { lat: 35.8256, lng: 10.639 },
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=35.8256,10.6390',
  phone: '+216 73 000 000',
  whatsapp: '+216 20 000 000',
  email: 'contact@maakoulet-bahriyya.com',
  hours: [
    { days: ['Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], opens: '11:30', closes: '15:00' },
    { days: ['Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], opens: '18:30', closes: '23:00' },
  ],
  closedDays: 'Lundi',
  social: {
    facebook: 'https://www.facebook.com/maakoulet.bahriyya.sousse',
    instagram: 'https://www.instagram.com/maakoulet.bahriyya.sousse',
  },
};

/**
 * VALEURS RÉELLES — à remplir au fur et à mesure que le client répond.
 * C'est ce bloc qui sera utilisé une fois DONNEES_DEMONSTRATION passé à false.
 */
const REEL: Identite = {
  /** TODO raison sociale exacte (mentions légales, facturation). */
  legalName: A_CONFIRMER,
  /** TODO une phrase, 150 caractères maximum — sert de meta description. */
  description: A_CONFIRMER,
  address: {
    /** TODO numéro et rue. */
    street: A_CONFIRMER,
    /** TODO ville — MOT-CLÉ SEO LE PLUS IMPORTANT DU SITE (voir README §4). */
    city: A_CONFIRMER,
    /** TODO code postal. */
    postalCode: A_CONFIRMER,
    country: 'TN',
  },
  /** TODO coordonnées exactes : clic droit sur le point dans Google Maps. */
  geo: { lat: 0, lng: 0 },
  /** TODO lien de la fiche d'établissement Google Maps. */
  googleMapsUrl: '',
  /** TODO numéro principal, format international. */
  phone: '+216 00 000 000',
  /** TODO numéro WhatsApp (optionnel). */
  whatsapp: '',
  /** TODO adresse e-mail professionnelle sur le domaine (optionnel). */
  email: '',
  /**
   * TODO horaires réels — alimente le JSON-LD openingHoursSpecification.
   * Codes de jours : Mo Tu We Th Fr Sa Su. Une entrée par plage horaire.
   */
  hours: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], opens: '00:00', closes: '00:00' }],
  /** TODO jour(s) de fermeture, en toutes lettres. */
  closedDays: A_CONFIRMER,
  /** TODO liens des pages sociales (URL complètes). */
  social: { facebook: '', instagram: '' },
};

const identite: Identite = DONNEES_DEMONSTRATION ? DEMO : REEL;

export const site = {
  /** Enseigne, affichée en arabe — c'est le logotype. Ne pas traduire. */
  nameAr: 'مأكولات بحرية',
  /** Translittération utilisée dans les textes français, les URL et le code. */
  nameFr: 'Maakoulet Bahriyya',
  tagline: 'Poissons & fruits de mer',

  ...identite,

  /**
   * Logo fourni par le client.
   * null  = logotype typographique arabe (comportement par défaut).
   * Sinon : déposer le fichier dans /public et écrire son chemin ici,
   * par exemple : logo: { src: '/logo.svg', width: 240, height: 80 }
   */
  logo: null as { src: string; width: number; height: number } | null,

  /** Fourchette de prix affichée dans le JSON-LD. TODO à ajuster. */
  priceRange: '$$',

  /** Seule source de vérité pour le domaine — jamais d'URL en dur ailleurs. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

/* -------------------------------------------------------------------------- */
/*  Helpers — permettent aux composants de masquer proprement l'incomplet.     */
/* -------------------------------------------------------------------------- */

/** Une valeur est-elle réellement renseignée ? */
export function estRenseigne(valeur: unknown): boolean {
  if (typeof valeur === 'number') return valeur !== 0;
  if (typeof valeur !== 'string') return Boolean(valeur);
  const v = valeur.trim();
  return v.length > 0 && v !== A_CONFIRMER && !v.includes('00 000 000');
}

export const aAdresse = () =>
  estRenseigne(site.address.street) && estRenseigne(site.address.city);

export const aVille = () => estRenseigne(site.address.city);

export const aTelephone = () => estRenseigne(site.phone);

export const aHoraires = () =>
  site.hours.some((h) => h.opens !== '00:00' || h.closes !== '00:00');

export const aGeo = () => site.geo.lat !== 0 && site.geo.lng !== 0;

/** Numéro nettoyé pour un lien tel: (aucun espace). */
export const telHref = () => `tel:${site.phone.replace(/\s+/g, '')}`;

/** Lien WhatsApp, ou null si non renseigné. */
export function whatsappHref(): string | null {
  if (!estRenseigne(site.whatsapp)) return null;
  return `https://wa.me/${site.whatsapp.replace(/[^\d]/g, '')}`;
}

/** Ville affichable dans les titres, ou chaîne vide si non confirmée. */
export const ville = () => (aVille() ? site.address.city : '');

/** « Maakoulet Bahriyya — Sousse » ou « Maakoulet Bahriyya » si pas de ville. */
export const nomEtVille = () => (aVille() ? `${site.nameFr} — ${site.address.city}` : site.nameFr);

/** Adresse sur une ligne, ou null. */
export function adresseLigne(): string | null {
  if (!aAdresse()) return null;
  const cp = estRenseigne(site.address.postalCode) ? `${site.address.postalCode} ` : '';
  return `${site.address.street}, ${cp}${site.address.city}`;
}

/** Description utilisable en meta, avec repli neutre tant qu'elle manque. */
export function descriptionSite(): string {
  if (estRenseigne(site.description)) return site.description;
  const v = ville();
  return v
    ? `Restaurant de poissons et fruits de mer à ${v} : arrivage du jour, grillades à la minute, livraison et vente à emporter.`
    : `Restaurant de poissons et fruits de mer : arrivage du jour, grillades à la minute, livraison et vente à emporter.`;
}

/**
 * Ce qui reste à obtenir du client — alimente le bandeau de développement.
 * En mode démonstration, la liste devient celle des valeurs FICTIVES affichées :
 * c'est exactement ce qu'il faudra remplacer.
 */
export function champsManquants(): string[] {
  if (DONNEES_DEMONSTRATION) {
    return [
      'adresse',
      'téléphone',
      'WhatsApp',
      'e-mail',
      'horaires',
      'coordonnées GPS',
      'Facebook et Instagram',
      'raison sociale',
      'avis clients',
      'textes de présentation',
      'carte et prix',
      'photos',
    ];
  }

  const manquants: string[] = [];
  if (!estRenseigne(site.legalName)) manquants.push('raison sociale (legalName)');
  if (!estRenseigne(site.description)) manquants.push('phrase de description');
  if (!estRenseigne(site.address.street)) manquants.push('rue');
  if (!aVille()) manquants.push('ville ⚠ mot-clé SEO principal');
  if (!estRenseigne(site.address.postalCode)) manquants.push('code postal');
  if (!aGeo()) manquants.push('coordonnées GPS');
  if (!estRenseigne(site.googleMapsUrl)) manquants.push('lien Google Maps');
  if (!aTelephone()) manquants.push('téléphone');
  if (!aHoraires()) manquants.push('horaires d’ouverture');
  if (!estRenseigne(site.closedDays)) manquants.push('jour de fermeture');
  if (!estRenseigne(site.social.facebook) && !estRenseigne(site.social.instagram)) {
    manquants.push('réseaux sociaux');
  }
  return manquants;
}

/** Jours de la semaine en français, pour l'affichage des horaires. */
export const JOURS_FR: Record<string, string> = {
  Mo: 'Lundi',
  Tu: 'Mardi',
  We: 'Mercredi',
  Th: 'Jeudi',
  Fr: 'Vendredi',
  Sa: 'Samedi',
  Su: 'Dimanche',
};
