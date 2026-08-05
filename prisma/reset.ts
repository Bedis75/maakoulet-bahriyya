import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { chargerEnv } from './env';

chargerEnv();

const prisma = new PrismaClient();

/**
 * `npm run db:reset`
 * Vide toute la démonstration (catégories, produits, commandes) et laisse une
 * base propre : uniquement le compte administrateur et les réglages.
 * C'est ce qu'on lancera le jour où le client livre sa vraie carte.
 */
async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('✓ Carte de démonstration et commandes supprimées');

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      isOpenForOrders: true,
      deliveryFeeMillimes: 0,
      minOrderMillimes: 0,
      deliveryZones: '',
      announcement: null,
    },
    create: { id: 1 },
  });
  console.log('✓ Réglages remis à zéro');

  const email = (process.env.ADMIN_EMAIL ?? 'admin@maakoulet-bahriyya.local').toLowerCase();
  const motDePasse = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: bcrypt.hashSync(motDePasse, 10), name: 'Administrateur' },
  });
  console.log(`✓ Compte administrateur conservé : ${email}`);

  console.log('');
  console.log('  Base prête pour la vraie carte : se connecter à /admin/carte et saisir.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erreur) => {
    console.error('✗ La réinitialisation a échoué :', erreur);
    await prisma.$disconnect();
    process.exit(1);
  });
