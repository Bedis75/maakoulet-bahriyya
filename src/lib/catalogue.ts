import { prisma } from '@/lib/prisma';

/** Seuil d'alerte « stock bas » — partagé par l'ardoise, la carte et l'admin. */
export const SEUIL_STOCK_BAS = 5;

export type ProduitPublic = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  priceMillimes: number;
  unit: string;
  imageUrl: string | null;
  stock: number | null;
  isAvailable: boolean;
  isCatchOfDay: boolean;
};

export type CategoriePublique = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  produits: ProduitPublic[];
};

/** Un produit est épuisé s'il est désactivé ou si son stock est tombé à zéro. */
export function estEpuise(produit: Pick<ProduitPublic, 'isAvailable' | 'stock'>): boolean {
  return !produit.isAvailable || (produit.stock !== null && produit.stock <= 0);
}

export function estStockBas(produit: Pick<ProduitPublic, 'isAvailable' | 'stock'>): boolean {
  return (
    !estEpuise(produit) && produit.stock !== null && produit.stock <= SEUIL_STOCK_BAS
  );
}

/** La carte complète, catégories ordonnées, produits ordonnés. */
export async function getCarte(): Promise<CategoriePublique[]> {
  const categories = await prisma.category.findMany({
    orderBy: { position: 'asc' },
    include: {
      products: {
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      },
    },
  });

  return categories.map((categorie) => ({
    id: categorie.id,
    slug: categorie.slug,
    name: categorie.name,
    description: categorie.description,
    produits: categorie.products.map((produit) => ({
      id: produit.id,
      slug: produit.slug,
      name: produit.name,
      description: produit.description,
      priceMillimes: produit.priceMillimes,
      unit: produit.unit,
      imageUrl: produit.imageUrl,
      stock: produit.stock,
      isAvailable: produit.isAvailable,
      isCatchOfDay: produit.isCatchOfDay,
    })),
  }));
}
