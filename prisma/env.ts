import fs from 'node:fs';
import path from 'node:path';

/**
 * Petit chargeur de .env pour les scripts lancés directement avec tsx
 * (seed, reset). Le CLI Prisma, lui, charge déjà le fichier tout seul.
 * Volontairement minimal : pas de dépendance supplémentaire.
 */
export function chargerEnv(fichier = '.env'): void {
  const chemin = path.resolve(process.cwd(), fichier);
  if (!fs.existsSync(chemin)) return;

  for (const ligne of fs.readFileSync(chemin, 'utf8').split(/\r?\n/)) {
    const texte = ligne.trim();
    if (!texte || texte.startsWith('#')) continue;
    const separateur = texte.indexOf('=');
    if (separateur === -1) continue;
    const cle = texte.slice(0, separateur).trim();
    let valeur = texte.slice(separateur + 1).trim();
    if (
      (valeur.startsWith('"') && valeur.endsWith('"')) ||
      (valeur.startsWith("'") && valeur.endsWith("'"))
    ) {
      valeur = valeur.slice(1, -1);
    }
    if (process.env[cle] === undefined) process.env[cle] = valeur;
  }
}
