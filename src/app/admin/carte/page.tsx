import type { Metadata } from 'next';
import Link from 'next/link';

import CategorieBloc from '@/components/admin/CategorieBloc';
import NouvelleCategorie from '@/components/admin/NouvelleCategorie';
import { exigerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'La carte' };

export default async function PageAdminCarte() {
  await exigerSession();

  const categories = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    include: {
      products: { orderBy: [{ position: 'asc' }, { name: 'asc' }] },
    },
  });

  const listeCategories = categories.map((categorie) => ({
    id: categorie.id,
    name: categorie.name,
  }));

  const nbProduits = categories.reduce((total, c) => total + c.products.length, 0);
  const nbDemo = categories.reduce(
    (total, c) => total + c.products.filter((p) => p.description?.startsWith('[DÉMO]')).length,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="surtitre">La carte</p>
          <h1 className="mt-3 text-3xl">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''} · {nbProduits} plat
            {nbProduits > 1 ? 's' : ''}
          </h1>
        </div>
        <NouvelleCategorie aucuneCategorie={categories.length === 0} />
      </div>

      {nbDemo > 0 && (
        <p className="border border-citron bg-citron/10 p-4 text-sm">
          <strong>{nbDemo} plat(s) de démonstration</strong> sont encore en ligne (descriptions
          commençant par « [DÉMO] »). Quand la vraie carte sera prête, lancer{' '}
          <code className="font-mono">npm run db:reset</code> pour repartir d’une base propre, puis
          saisir les vraies catégories et les vrais plats ici.
        </p>
      )}

      <p className="text-sm text-encre/65">
        Le prix et le stock se modifient directement dans la liste : tapez la nouvelle valeur puis
        « OK ». Un stock vide signifie « illimité ». Les changements apparaissent immédiatement sur{' '}
        <Link href="/carte" className="lien-souligne">
          la carte publique
        </Link>
        .
      </p>

      {categories.length === 0 ? (
        <p className="carte p-8 text-encre/65">
          La carte est vide. Créez une première catégorie ci-dessus, puis ajoutez-y vos plats.
        </p>
      ) : (
        <div className="space-y-8">
          {categories.map((categorie) => (
            <CategorieBloc
              key={categorie.id}
              categories={listeCategories}
              categorie={{
                id: categorie.id,
                name: categorie.name,
                description: categorie.description,
                produits: categorie.products.map((produit) => ({
                  id: produit.id,
                  name: produit.name,
                  description: produit.description,
                  priceMillimes: produit.priceMillimes,
                  unit: produit.unit,
                  stock: produit.stock,
                  imageUrl: produit.imageUrl,
                  isAvailable: produit.isAvailable,
                  isCatchOfDay: produit.isCatchOfDay,
                  categoryId: produit.categoryId,
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
