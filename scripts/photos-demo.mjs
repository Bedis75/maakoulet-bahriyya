#!/usr/bin/env node
/**
 * ---------------------------------------------------------------------------
 *  PHOTOS DE DÉMONSTRATION — provisoires, à remplacer par celles du client.
 * ---------------------------------------------------------------------------
 *  Télécharge, pour chaque plat de la carte de démonstration, une photo
 *  Wikimedia Commons sous licence réutilisable commercialement, l'enregistre
 *  dans /public/photos et renseigne `imageUrl` en base.
 *
 *  Les crédits (auteur + licence + lien) sont écrits dans
 *  public/photos/CREDITS.md — obligatoire pour les licences CC BY / CC BY-SA.
 *
 *  Usage :
 *    node scripts/photos-demo.mjs --prospection   liste les candidats, ne télécharge rien
 *    node scripts/photos-demo.mjs                 télécharge et met la base à jour
 *    node scripts/photos-demo.mjs --purge         supprime les photos et vide imageUrl
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';

const AGENT = 'MaakouletBahriyya/1.0 (site de restaurant; https://github.com/Bedis75/maakoulet-bahriyya)';
const DOSSIER = path.resolve(process.cwd(), 'public/photos');

/** Lecture de DATABASE_URL depuis .env (même principe que prisma/env.ts). */
function chargerEnv() {
  const chemin = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(chemin)) return;
  for (const ligne of fs.readFileSync(chemin, 'utf8').split(/\r?\n/)) {
    const texte = ligne.trim();
    if (!texte || texte.startsWith('#')) continue;
    const separateur = texte.indexOf('=');
    if (separateur === -1) continue;
    const cle = texte.slice(0, separateur).trim();
    const valeur = texte.slice(separateur + 1).trim().replace(/^["']|["']$/g, '');
    if (process.env[cle] === undefined) process.env[cle] = valeur;
  }
}

/**
 * Chaque entrée : le plat, la recherche Commons, et le fichier retenu.
 * `fichier` est figé après prospection pour que le script soit reproductible :
 * on ne dépend pas de l'ordre de pertinence du moteur de recherche.
 */
/**
 * Le restaurant a fourni ses propres photos : elles sont installées par le seed
 * et ne passent pas par ce script. Il ne reste ici que les poissons et fruits
 * de mer pour lesquels aucune photo maison n'existe encore.
 */
export const PHOTOS = [
  { slug: 'loup-de-mer', recherche: 'grilled sea bass fish', fichier: 'Levrek Izgara Beykoz Koru Sosyal Tesisleri.JPG' },
  { slug: 'sardines-grillees', recherche: 'grilled sardines', fichier: 'Grilled sardines.jpg' },
  { slug: 'crevettes-royales', recherche: 'grilled prawns plate', fichier: 'Grilled prawn with herb.jpg' },
  { slug: 'calamars-frits', recherche: 'fried calamari rings', fichier: 'Deep-fried Calamari Rings.jpg' },
  { slug: 'poulpe-grille', recherche: 'grilled octopus', fichier: 'Grilled octopus with potatoes and chorizo - Cambridge, MA.jpg' },
];

/** Licences acceptées : réutilisation commerciale autorisée. */
const LICENCES_OK = /^(cc0|cc by|cc by-sa|public domain|pd|no restrictions|attribution)/i;

async function chercher(recherche, limite = 10) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json' +
    '&generator=search&gsrnamespace=6&gsrlimit=' +
    limite +
    '&gsrsearch=' +
    encodeURIComponent(`filetype:bitmap ${recherche}`) +
    '&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=1400';

  const reponse = await fetch(url, { headers: { 'User-Agent': AGENT } });
  if (!reponse.ok) throw new Error(`Commons a répondu ${reponse.status}`);
  const donnees = await reponse.json();
  const pages = donnees?.query?.pages ? Object.values(donnees.query.pages) : [];

  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      const nettoyer = (valeur) =>
        (valeur?.value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      return {
        titre: page.title.replace(/^File:/, ''),
        mime: info.mime,
        licence: nettoyer(meta.LicenseShortName) || 'inconnue',
        auteur: nettoyer(meta.Artist) || 'auteur inconnu',
        page: info.descriptionurl,
        telechargement: info.thumburl || info.url,
      };
    })
    .filter(Boolean)
    .filter((c) => /^image\/(jpeg|png|webp)$/.test(c.mime))
    .filter((c) => LICENCES_OK.test(c.licence));
}

async function prospecter(filtre) {
  const liste = filtre ? PHOTOS.filter((p) => p.slug.includes(filtre)) : PHOTOS;
  for (const entree of liste) {
    console.log(`\n### ${entree.slug}  ←  « ${entree.recherche} »`);
    try {
      const candidats = await chercher(entree.recherche);
      if (candidats.length === 0) {
        console.log('  (aucun résultat sous licence acceptable)');
        continue;
      }
      candidats.forEach((c, i) => {
        console.log(`  [${i}] ${c.titre}`);
        console.log(`      ${c.licence} · ${c.auteur}`);
      });
    } catch (erreur) {
      console.log(`  ERREUR : ${erreur.message}`);
    }
  }
}

async function telecharger() {
  const { PrismaClient } = await import('@prisma/client');
  chargerEnv();
  const prisma = new PrismaClient();

  fs.mkdirSync(DOSSIER, { recursive: true });
  const credits = [];
  let posees = 0;

  for (const entree of PHOTOS) {
    const produit = await prisma.product.findUnique({ where: { slug: entree.slug } });
    if (!produit) {
      console.log(`· ${entree.slug} : absent de la base, ignoré`);
      continue;
    }

    let candidats;
    try {
      candidats = await chercher(entree.recherche);
    } catch (erreur) {
      console.log(`✗ ${entree.slug} : ${erreur.message}`);
      continue;
    }

    const choisi = entree.fichier
      ? candidats.find((c) => c.titre === entree.fichier)
      : candidats[0];

    if (!choisi) {
      console.log(`· ${entree.slug} : aucune photo utilisable, motif SVG conservé`);
      continue;
    }

    const extension = choisi.mime === 'image/png' ? 'png' : choisi.mime === 'image/webp' ? 'webp' : 'jpg';
    const nomFichier = `${entree.slug.normalize('NFD').replace(/[̀-ͯ]/g, '')}.${extension}`;
    const destination = path.join(DOSSIER, nomFichier);

    const image = await fetch(choisi.telechargement, { headers: { 'User-Agent': AGENT } });
    if (!image.ok) {
      console.log(`✗ ${entree.slug} : téléchargement ${image.status}`);
      continue;
    }
    fs.writeFileSync(destination, Buffer.from(await image.arrayBuffer()));

    await prisma.product.update({
      where: { id: produit.id },
      data: { imageUrl: `/photos/${nomFichier}` },
    });

    credits.push({
      plat: produit.name,
      fichier: `/photos/${nomFichier}`,
      titre: choisi.titre,
      page: choisi.page,
      auteur: choisi.auteur,
      licence: choisi.licence,
    });
    posees += 1;
    console.log(`✓ ${entree.slug} → ${nomFichier}  (${choisi.licence})`);
  }

  // Lu par la page /credits-photos, qui rend l'attribution accessible aux
  // visiteurs — obligatoire pour les licences CC BY et CC BY-SA.
  credits.sort((a, b) => a.plat.localeCompare(b.plat, 'fr'));
  fs.writeFileSync(
    path.join(DOSSIER, 'credits.json'),
    JSON.stringify({ genere: new Date().toISOString(), photos: credits }, null, 2),
    'utf8',
  );

  await prisma.$disconnect();
  console.log(`\n✓ ${posees} photo(s) installées · attribution publiée sur /credits-photos`);
}

async function purger() {
  const { PrismaClient } = await import('@prisma/client');
  chargerEnv();
  const prisma = new PrismaClient();

  // ATTENTION : /public/photos contient aussi les photos du restaurant.
  // On ne retire QUE les fichiers empruntés, listés dans credits.json.
  const fichierCredits = path.join(DOSSIER, 'credits.json');
  if (!fs.existsSync(fichierCredits)) {
    console.log('· Aucune photo empruntée à retirer (credits.json absent).');
    await prisma.$disconnect();
    return;
  }

  const { photos = [] } = JSON.parse(fs.readFileSync(fichierCredits, 'utf8'));
  let supprimes = 0;

  for (const credit of photos) {
    await prisma.product.updateMany({
      where: { imageUrl: credit.fichier },
      data: { imageUrl: null },
    });
    const chemin = path.join(DOSSIER, path.basename(credit.fichier));
    if (fs.existsSync(chemin)) {
      fs.rmSync(chemin);
      supprimes += 1;
    }
  }

  fs.rmSync(fichierCredits, { force: true });

  await prisma.$disconnect();
  console.log(
    `✓ ${supprimes} photo(s) empruntée(s) supprimée(s) · les photos du restaurant sont intactes`,
  );
}

const mode = process.argv[2];
if (mode === '--prospection') await prospecter(process.argv[3]);
else if (mode === '--purge') await purger();
else await telecharger();
