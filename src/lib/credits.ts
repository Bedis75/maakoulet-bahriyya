import fs from 'node:fs';
import path from 'node:path';

export type CreditPhoto = {
  plat: string;
  fichier: string;
  titre: string;
  page: string;
  auteur: string;
  licence: string;
};

/**
 * Crédits des photos de démonstration, écrits par scripts/photos-demo.mjs.
 * Le fichier n'existe pas quand le site n'utilise que les motifs SVG, ou après
 * un `npm run photos:purge` : tout ce qui en dépend disparaît alors du site.
 */
export function getCreditsPhotos(): CreditPhoto[] {
  const chemin = path.join(process.cwd(), 'public', 'photos', 'credits.json');
  try {
    if (!fs.existsSync(chemin)) return [];
    const donnees = JSON.parse(fs.readFileSync(chemin, 'utf8')) as { photos?: CreditPhoto[] };
    return Array.isArray(donnees.photos) ? donnees.photos : [];
  } catch {
    return [];
  }
}
