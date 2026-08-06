import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { chargerEnv } from './env';

chargerEnv();

const prisma = new PrismaClient();

/**
 * ---------------------------------------------------------------------------
 *  CARTE DU RESTAURANT
 * ---------------------------------------------------------------------------
 *  Les plats et les photos viennent du restaurant : ce sont ses vrais plats,
 *  photographiés chez lui. Les descriptions ont été écrites d'après les photos
 *  et restent à faire valider.
 *
 *  ⚠ LES PRIX SONT ENCORE FICTIFS — valeurs rondes, à remplacer par les vrais
 *  (voir DONNEES-A-OBTENIR.md §4). De même pour le mode de vente : au kilo ou
 *  à la portion selon les poissons, à confirmer.
 *
 *  Les poissons sans photo maison utilisent des photos empruntées sous licence
 *  libre, installées séparément par `npm run photos:demo`.
 * ---------------------------------------------------------------------------
 */

type ProduitCarte = {
  slug: string;
  name: string;
  description: string;
  priceMillimes: number;
  unit: 'PIECE' | 'KG' | 'PORTION';
  /** Photo du restaurant. Absent = photo empruntée ou motif SVG. */
  imageUrl?: string;
  stock?: number | null;
  isAvailable?: boolean;
  isCatchOfDay?: boolean;
};

type CategorieCarte = {
  slug: string;
  name: string;
  description: string;
  produits: ProduitCarte[];
};

const CARTE: CategorieCarte[] = [
  {
    slug: 'entrees',
    name: 'Entrées & salades',
    description:
      'Les entrées se préparent le matin même : poivrons grillés au feu, thon, olives, huile d’olive. À partager ou à prendre avec un plat.',
    produits: [
      {
        slug: 'brik',
        name: 'Brik',
        description:
          'Feuille de malsouka frite minute, garnie et refermée en triangle, servie brûlante avec un quartier de citron.',
        priceMillimes: 4000,
        unit: 'PIECE',
        imageUrl: '/photos/brik.jpg',
      },
      {
        slug: 'salade-mechouia',
        name: 'Salade mechouia au thon',
        description:
          'Poivrons et tomates grillés puis écrasés à la main, huile d’olive, thon émietté, olives et piment entier posé dessus.',
        priceMillimes: 6000,
        unit: 'PORTION',
        imageUrl: '/photos/salade-mechouia.jpg',
      },
      {
        slug: 'salade-tunisienne',
        name: 'Salade tunisienne au thon',
        description:
          'Tomate, concombre, oignon et poivron taillés fin, thon, olive et câpres, assaisonnés au citron et à l’huile d’olive.',
        priceMillimes: 5000,
        unit: 'PORTION',
      },
    ],
  },
  {
    slug: 'tajines-bouchees',
    name: 'Tajines & bouchées',
    description:
      'Le tajine tunisien, cuit au four et coupé en parts, et les bouchées que l’on prépare pour les tables nombreuses et les commandes de traiteur.',
    produits: [
      {
        slug: 'tajine-tunisien',
        name: 'Tajine tunisien',
        description:
          'Œufs, fromage et persil pris au four, coupé en parts épaisses. Se mange tiède ou froid, seul ou avec une salade.',
        priceMillimes: 5000,
        unit: 'PORTION',
        imageUrl: '/photos/tajine-tunisien.jpg',
      },
      {
        slug: 'tajine-el-bey',
        name: 'Tajine El Bey',
        description:
          'La version des grands jours : trois couches montées puis cuites ensemble, recouvertes de pistache concassée. Se commande à l’avance.',
        priceMillimes: 9000,
        unit: 'PORTION',
        imageUrl: '/photos/tajine-el-bey.jpg',
        isCatchOfDay: true,
      },
      {
        slug: 'toasts-gratines',
        name: 'Toasts gratinés',
        description:
          'Tranches de pain garnies de tomate, persil et fromage, passées au four jusqu’à ce que le dessus dore. Vendues à la douzaine.',
        priceMillimes: 12000,
        unit: 'PORTION',
        imageUrl: '/photos/toasts-gratines.jpg',
      },
    ],
  },
  {
    slug: 'plats',
    name: 'Plats',
    description:
      'Chaque plat arrive complet : la pièce de viande ou de poisson, les pâtes à la sauce rouge, les frites coupées à la main, la mechouia et la salade tunisienne.',
    produits: [
      {
        slug: 'escalope-panee',
        name: 'Escalope panée',
        description:
          'Escalope de dinde panée et frite à la commande, servie avec pâtes à la sauce rouge, frites, mechouia et salade au thon.',
        priceMillimes: 15000,
        unit: 'PORTION',
        imageUrl: '/photos/escalope-panee.jpg',
      },
      {
        slug: 'escalope-grillee',
        name: 'Escalope grillée',
        description:
          'Escalope de dinde grillée nature, plus légère que la panée, avec pâtes, frites, mechouia, salade au thon et pain maison.',
        priceMillimes: 15000,
        unit: 'PORTION',
        imageUrl: '/photos/escalope-grillee.jpg',
      },
      {
        slug: 'escalope-merguez',
        name: 'Escalope & merguez grillées',
        description:
          'Un mélange grillé au charbon : escalope tranchée et merguez maison, persil frais. Le plat des gros appétits.',
        priceMillimes: 18000,
        unit: 'PORTION',
        imageUrl: '/photos/escalope-merguez.jpg',
      },
      {
        slug: 'poulet-couscous',
        name: 'Poulet rôti & couscous',
        description:
          'Cuisse de poulet rôtie jusqu’à ce que la peau croustille, couscous aux pois chiches, piment grillé, mechouia et salade au thon.',
        priceMillimes: 14000,
        unit: 'PORTION',
        imageUrl: '/photos/poulet-couscous.jpg',
      },
      {
        slug: 'kamounia',
        name: 'Kamounia',
        description:
          'Le plat mijoté de la maison : viande fondante en sauce rouge au cumin et à l’ail, persil et oignon frais au moment de servir.',
        priceMillimes: 13000,
        unit: 'PORTION',
        imageUrl: '/photos/kamounia.jpg',
        stock: 8,
      },
      {
        slug: 'kamounia-viande',
        name: 'Kamounia à la viande',
        description:
          'Même sauce au cumin, morceaux de viande plus généreux, mijotés longuement. Servie avec du pain pour saucer.',
        priceMillimes: 16000,
        unit: 'PORTION',
        imageUrl: '/photos/kamounia-viande.jpg',
      },
    ],
  },
  {
    slug: 'pates-et-riz',
    name: 'Pâtes & riz',
    description:
      'Les pâtes sont cuites à la commande dans leur sauce, jamais réchauffées. Le riz djerbien se prépare en quantité limitée chaque jour.',
    produits: [
      {
        slug: 'pates-au-poulet',
        name: 'Pâtes au poulet',
        description:
          'Penne mijotées dans une sauce tomate relevée avec les morceaux de poulet, piments verts entiers et persil.',
        priceMillimes: 13000,
        unit: 'PORTION',
        imageUrl: '/photos/pates-au-poulet.jpg',
      },
      {
        slug: 'spaghetti-crevettes',
        name: 'Spaghetti aux crevettes',
        description:
          'Spaghetti liés à une sauce tomate courte, crevettes décortiquées saisies à part, piment doux grillé posé dessus.',
        priceMillimes: 18000,
        unit: 'PORTION',
        imageUrl: '/photos/spaghetti-crevettes.jpg',
      },
      {
        slug: 'spaghetti-viande',
        name: 'Spaghetti à la viande',
        description:
          'Spaghetti à la sauce rouge, morceau de viande mijoté posé au centre, piment grillé et citron.',
        priceMillimes: 16000,
        unit: 'PORTION',
        imageUrl: '/photos/spaghetti-viande.jpg',
      },
      {
        slug: 'riz-djerbien',
        name: 'Riz djerbien',
        description:
          'Riz cuit à la vapeur avec les herbes, les épinards et les pois chiches, morceaux de viande et de foie mêlés au grain.',
        priceMillimes: 12000,
        unit: 'PORTION',
        imageUrl: '/photos/riz-djerbien.jpg',
        stock: 3,
        isCatchOfDay: true,
      },
    ],
  },
  {
    slug: 'poissons-fruits-de-mer',
    name: 'Poissons & fruits de mer',
    description:
      'Le poisson dépend de ce qui rentre le matin. Quand une ligne disparaît de l’ardoise, c’est qu’il n’y en a plus jusqu’au lendemain.',
    produits: [
      {
        slug: 'dorade-grillee',
        name: 'Dorade grillée',
        description:
          'Dorade entière grillée sur la braise, peau croustillante, servie avec pâtes à la sauce rouge, frites, mechouia et salade.',
        priceMillimes: 25000,
        unit: 'PORTION',
        imageUrl: '/photos/dorade-grillee.jpg',
        isCatchOfDay: true,
      },
      {
        slug: 'loup-de-mer',
        name: 'Loup de mer',
        description:
          'Loup entier grillé au charbon, arrosé d’huile d’olive et de citron. Vendu au poids, pesé avant cuisson.',
        priceMillimes: 60000,
        unit: 'KG',
        isCatchOfDay: true,
      },
      {
        slug: 'sardines-grillees',
        name: 'Sardines grillées',
        description:
          'Sardines du jour grillées entières au charbon, servies avec harissa, citron et pain. Le plat le plus simple de la carte.',
        priceMillimes: 15000,
        unit: 'KG',
        isCatchOfDay: true,
      },
      {
        slug: 'crevettes-royales',
        name: 'Crevettes royales',
        description:
          'Grosses crevettes saisies à la plancha avec ail et persil. Quantité limitée, selon l’arrivage du matin.',
        priceMillimes: 70000,
        unit: 'KG',
        stock: 4,
        isCatchOfDay: true,
      },
      {
        slug: 'calamars-frits',
        name: 'Calamars frits',
        description:
          'Anneaux de calamar farinés et frits minute, servis très chauds avec une sauce citronnée et des frites.',
        priceMillimes: 20000,
        unit: 'PORTION',
        isCatchOfDay: true,
      },
      {
        slug: 'poulpe-grille',
        name: 'Poulpe grillé',
        description:
          'Poulpe attendri puis saisi sur le grill, huile d’olive, origan et citron. Se commande de préférence à l’avance.',
        priceMillimes: 25000,
        unit: 'PORTION',
        isAvailable: false,
        isCatchOfDay: true,
      },
    ],
  },
  {
    slug: 'boissons',
    name: 'Boissons',
    description: 'Boissons fraîches et thé à la menthe préparé à la commande.',
    produits: [
      {
        slug: 'eau-minerale-50cl',
        name: 'Eau minérale 50 cl',
        description: 'Bouteille d’eau minérale fraîche.',
        priceMillimes: 1000,
        unit: 'PIECE',
      },
      {
        slug: 'boisson-gazeuse',
        name: 'Boisson gazeuse 33 cl',
        description: 'Canette au choix, servie fraîche.',
        priceMillimes: 2000,
        unit: 'PIECE',
      },
      {
        slug: 'the-a-la-menthe',
        name: 'Thé à la menthe',
        description: 'Thé vert infusé avec de la menthe fraîche et des pignons de pin.',
        priceMillimes: 2000,
        unit: 'PIECE',
      },
    ],
  },
];

async function main() {
  // 1. Compte administrateur ------------------------------------------------
  const email = (process.env.ADMIN_EMAIL ?? 'admin@maakoulet-bahriyya.local').toLowerCase();
  const motDePasse = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
  const passwordHash = bcrypt.hashSync(motDePasse, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: 'Administrateur' },
  });
  console.log(`✓ Compte administrateur : ${email}`);

  // 2. Réglages de démonstration --------------------------------------------
  // Fictifs : frais, minimum et zones sont à confirmer avec le client
  // (DONNEES-A-OBTENIR.md §5). `npm run db:reset` les remet tous à zéro.
  const REGLAGES_DEMO = {
    isOpenForOrders: true,
    deliveryFeeMillimes: 3000,
    minOrderMillimes: 20000,
    deliveryZones: 'Ariana centre, Ennasr, Menzah, Borj Louzir, Riadh Landlous, La Soukra',
    announcement: 'Aujourd’hui : dorade grillée et riz djerbien.',
  };

  await prisma.setting.upsert({
    where: { id: 1 },
    update: REGLAGES_DEMO,
    create: { id: 1, ...REGLAGES_DEMO },
  });
  console.log('✓ Réglages de démonstration');

  // 3. Carte ----------------------------------------------------------------
  let nbProduits = 0;
  let nbPhotos = 0;

  for (const [indexCategorie, categorie] of CARTE.entries()) {
    const enregistree = await prisma.category.upsert({
      where: { slug: categorie.slug },
      update: {
        name: categorie.name,
        description: categorie.description,
        position: indexCategorie,
      },
      create: {
        slug: categorie.slug,
        name: categorie.name,
        description: categorie.description,
        position: indexCategorie,
      },
    });

    for (const [indexProduit, produit] of categorie.produits.entries()) {
      const donnees = {
        name: produit.name,
        description: produit.description,
        priceMillimes: produit.priceMillimes,
        unit: produit.unit,
        imageUrl: produit.imageUrl ?? null,
        stock: produit.stock ?? null,
        isAvailable: produit.isAvailable ?? true,
        isCatchOfDay: produit.isCatchOfDay ?? false,
        position: indexProduit,
        categoryId: enregistree.id,
      };

      await prisma.product.upsert({
        where: { slug: produit.slug },
        // Le champ imageUrl n'est pas écrasé s'il a déjà été renseigné depuis
        // le back-office ou par le script des photos empruntées.
        update: produit.imageUrl ? donnees : { ...donnees, imageUrl: undefined },
        create: { slug: produit.slug, ...donnees },
      });

      nbProduits += 1;
      if (produit.imageUrl) nbPhotos += 1;
    }
  }

  console.log(`✓ Carte : ${CARTE.length} catégories, ${nbProduits} plats`);
  console.log(`✓ ${nbPhotos} photos du restaurant rattachées`);
  console.log('');
  console.log('  ⚠ Les PRIX sont encore fictifs — voir DONNEES-A-OBTENIR.md §4.');
  console.log('  Les poissons sans photo maison : npm run photos:demo');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erreur) => {
    console.error('✗ Le seed a échoué :', erreur);
    await prisma.$disconnect();
    process.exit(1);
  });
