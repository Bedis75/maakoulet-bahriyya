import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { chargerEnv } from './env';

chargerEnv();

const prisma = new PrismaClient();

/**
 * ---------------------------------------------------------------------------
 *  DONNÉES DE DÉMONSTRATION
 * ---------------------------------------------------------------------------
 *  Rien ici ne vient du client. Toutes les descriptions commencent par [DÉMO]
 *  et les prix sont des valeurs rondes manifestement provisoires.
 *  Quand la vraie carte arrivera : `npm run db:reset` puis saisie dans /admin/carte.
 * ---------------------------------------------------------------------------
 */

const D = '[DÉMO] ';

type ProduitDemo = {
  slug: string;
  name: string;
  description: string;
  priceMillimes: number;
  unit: 'PIECE' | 'KG' | 'PORTION';
  stock?: number | null;
  isAvailable?: boolean;
  isCatchOfDay?: boolean;
};

type CategorieDemo = {
  slug: string;
  name: string;
  description: string;
  produits: ProduitDemo[];
};

const CARTE_DEMO: CategorieDemo[] = [
  {
    slug: 'entrees',
    name: 'Entrées',
    description:
      D + 'Salades fraîches et petites assiettes à partager, préparées le matin même.',
    produits: [
      {
        slug: 'salade-mechouia-thon',
        name: 'Salade mechouia au thon',
        description: D + 'Poivrons et tomates grillés, thon, olives, œuf dur, filet d’huile d’olive.',
        priceMillimes: 8000,
        unit: 'PORTION',
      },
      {
        slug: 'brik-aux-crevettes',
        name: 'Brik aux crevettes',
        description: D + 'Feuille de malsouka croustillante, crevettes, fromage, persil, citron.',
        priceMillimes: 6000,
        unit: 'PIECE',
      },
      {
        slug: 'salade-de-poulpe',
        name: 'Salade de poulpe',
        description: D + 'Poulpe tiède, pommes de terre, oignon rouge, citron et huile d’olive.',
        priceMillimes: 14000,
        unit: 'PORTION',
      },
    ],
  },
  {
    slug: 'poissons-grilles',
    name: 'Poissons grillés',
    description:
      D +
      'Poissons entiers vendus au kilo, pesés devant vous puis grillés à la minute. Servis avec citron et salade.',
    produits: [
      {
        slug: 'loup-de-mer',
        name: 'Loup de mer',
        description: D + 'Loup sauvage pêché à la ligne, grillé entier, chair ferme et fine.',
        priceMillimes: 60000,
        unit: 'KG',
        isCatchOfDay: true,
      },
      {
        slug: 'daurade-royale',
        name: 'Daurade royale',
        description: D + 'Daurade d’élevage, grillée entière, servie avec citron et huile d’olive.',
        priceMillimes: 45000,
        unit: 'KG',
        isCatchOfDay: true,
      },
      {
        slug: 'rouget-de-roche',
        name: 'Rouget de roche',
        description: D + 'Petits rougets frits ou grillés, à manger avec les doigts.',
        priceMillimes: 40000,
        unit: 'KG',
        isCatchOfDay: true,
        stock: 3,
      },
      {
        slug: 'sardines-grillees',
        name: 'Sardines grillées',
        description: D + 'Sardines fraîches du jour, grillées au charbon, harissa et citron.',
        priceMillimes: 15000,
        unit: 'KG',
      },
      {
        slug: 'mérou',
        name: 'Mérou',
        description: D + 'Mérou en tranches épaisses, grillé lentement, arrosé de tchermila.',
        priceMillimes: 80000,
        unit: 'KG',
        isCatchOfDay: true,
        isAvailable: false,
      },
    ],
  },
  {
    slug: 'fruits-de-mer',
    name: 'Fruits de mer',
    description:
      D + 'Crevettes, calamars, poulpe et coquillages, selon ce que ramènent les barques.',
    produits: [
      {
        slug: 'crevettes-royales',
        name: 'Crevettes royales',
        description: D + 'Grosses crevettes grillées à la plancha, ail et persil, quantité limitée.',
        priceMillimes: 70000,
        unit: 'KG',
        isCatchOfDay: true,
        stock: 8,
      },
      {
        slug: 'calamars-frits',
        name: 'Calamars frits',
        description: D + 'Anneaux de calamar panés minute, servis avec une sauce citronnée.',
        priceMillimes: 20000,
        unit: 'PORTION',
      },
      {
        slug: 'poulpe-grille',
        name: 'Poulpe grillé',
        description: D + 'Poulpe attendri puis saisi au grill, huile d’olive et origan.',
        priceMillimes: 25000,
        unit: 'PORTION',
        isCatchOfDay: true,
      },
      {
        slug: 'moules-marinieres',
        name: 'Moules à la tunisienne',
        description: D + 'Moules mijotées à la tomate, ail et piment doux, pain de semoule.',
        priceMillimes: 18000,
        unit: 'PORTION',
      },
    ],
  },
  {
    slug: 'plats',
    name: 'Plats',
    description: D + 'Les plats de la maison, préparés à la commande.',
    produits: [
      {
        slug: 'couscous-au-poisson',
        name: 'Couscous au poisson',
        description: D + 'Semoule roulée à la main, bouillon de poisson, légumes de saison.',
        priceMillimes: 25000,
        unit: 'PORTION',
      },
      {
        slug: 'riz-aux-fruits-de-mer',
        name: 'Riz aux fruits de mer',
        description: D + 'Riz parfumé, crevettes, calamars et moules, cuit dans son jus.',
        priceMillimes: 28000,
        unit: 'PORTION',
      },
      {
        slug: 'ojja-aux-crevettes',
        name: 'Ojja aux crevettes',
        description: D + 'Œufs brouillés à la tomate et au piment, crevettes décortiquées.',
        priceMillimes: 20000,
        unit: 'PORTION',
      },
    ],
  },
  {
    slug: 'accompagnements',
    name: 'Accompagnements',
    description: D + 'À ajouter à un poisson grillé ou à partager au milieu de la table.',
    produits: [
      {
        slug: 'frites-maison',
        name: 'Frites maison',
        description: D + 'Pommes de terre fraîches coupées et frites à la commande.',
        priceMillimes: 5000,
        unit: 'PORTION',
      },
      {
        slug: 'salade-tunisienne',
        name: 'Salade tunisienne',
        description: D + 'Tomate, concombre, oignon et poivron taillés fin, citron.',
        priceMillimes: 6000,
        unit: 'PORTION',
      },
      {
        slug: 'riz-blanc',
        name: 'Riz blanc',
        description: D + 'Riz nature, beurre et citron.',
        priceMillimes: 4000,
        unit: 'PORTION',
      },
    ],
  },
  {
    slug: 'desserts',
    name: 'Desserts',
    description: D + 'Pour finir, quelque chose de simple.',
    produits: [
      {
        slug: 'assiette-de-fruits',
        name: 'Assiette de fruits de saison',
        description: D + 'Fruits frais coupés selon la saison.',
        priceMillimes: 6000,
        unit: 'PORTION',
      },
      {
        slug: 'bambalouni',
        name: 'Bambalouni',
        description: D + 'Beignet tunisien saupoudré de sucre, servi tiède.',
        priceMillimes: 3000,
        unit: 'PIECE',
      },
    ],
  },
  {
    slug: 'boissons',
    name: 'Boissons',
    description: D + 'Boissons fraîches et thé à la menthe.',
    produits: [
      {
        slug: 'eau-minerale-50cl',
        name: 'Eau minérale 50 cl',
        description: D + 'Bouteille d’eau minérale.',
        priceMillimes: 2000,
        unit: 'PIECE',
      },
      {
        slug: 'boisson-gazeuse',
        name: 'Boisson gazeuse 33 cl',
        description: D + 'Canette au choix.',
        priceMillimes: 3000,
        unit: 'PIECE',
      },
      {
        slug: 'the-a-la-menthe',
        name: 'Thé à la menthe',
        description: D + 'Thé vert, menthe fraîche, pignons de pin.',
        priceMillimes: 3000,
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

  // 2. Réglages par défaut --------------------------------------------------
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isOpenForOrders: true,
      deliveryFeeMillimes: 0,
      minOrderMillimes: 0,
      deliveryZones: '',
      announcement: null,
    },
  });
  console.log('✓ Réglages par défaut');

  // 3. Carte de démonstration ----------------------------------------------
  let nbProduits = 0;
  for (const [indexCategorie, categorie] of CARTE_DEMO.entries()) {
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
      await prisma.product.upsert({
        where: { slug: produit.slug },
        update: {
          name: produit.name,
          description: produit.description,
          priceMillimes: produit.priceMillimes,
          unit: produit.unit,
          stock: produit.stock ?? null,
          isAvailable: produit.isAvailable ?? true,
          isCatchOfDay: produit.isCatchOfDay ?? false,
          position: indexProduit,
          categoryId: enregistree.id,
        },
        create: {
          slug: produit.slug,
          name: produit.name,
          description: produit.description,
          priceMillimes: produit.priceMillimes,
          unit: produit.unit,
          stock: produit.stock ?? null,
          isAvailable: produit.isAvailable ?? true,
          isCatchOfDay: produit.isCatchOfDay ?? false,
          position: indexProduit,
          categoryId: enregistree.id,
        },
      });
      nbProduits += 1;
    }
  }

  console.log(`✓ Carte de démonstration : ${CARTE_DEMO.length} catégories, ${nbProduits} produits`);
  console.log('');
  console.log('  Ces données sont FICTIVES et marquées [DÉMO].');
  console.log('  Quand le client fournira sa vraie carte : npm run db:reset');
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
