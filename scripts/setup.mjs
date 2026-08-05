#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * `npm run setup` — installation en une commande sur une machine vierge :
 *   1. crée .env à partir de .env.example s'il manque
 *   2. génère le client Prisma
 *   3. crée le schéma de la base
 *   4. insère le compte admin, les réglages et la carte de démonstration
 */

const racine = process.cwd();
const env = path.join(racine, '.env');
const exemple = path.join(racine, '.env.example');

if (!fs.existsSync(env)) {
  fs.copyFileSync(exemple, env);
  console.log('✓ .env créé à partir de .env.example');
} else {
  console.log('· .env existe déjà, conservé tel quel');
}

const etapes = [
  ['Génération du client Prisma', 'npx prisma generate'],
  ['Création du schéma de la base', 'npx prisma db push'],
  ['Insertion des données initiales', 'npx tsx prisma/seed.ts'],
];

for (const [titre, commande] of etapes) {
  console.log(`\n▸ ${titre}…`);
  execSync(commande, { stdio: 'inherit', cwd: racine });
}

console.log('\n✓ Installation terminée. Lancer maintenant : npm run dev');
