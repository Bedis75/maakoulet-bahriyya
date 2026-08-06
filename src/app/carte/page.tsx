import type { Metadata } from 'next';

import JsonLd from '@/components/JsonLd';
import MenuBrowser from '@/components/MenuBrowser';
import { estEpuise, getCarte } from '@/lib/catalogue';
import { construireMetadata, jsonLdFilAriane, urlAbsolue } from '@/lib/seo';
import { getReglages } from '@/lib/settings';
import { ville } from '@/lib/site';

const v = ville();

export const metadata: Metadata = construireMetadata({
  titre: v ? `Carte — cuisine tunisienne et poisson à ${v}` : 'Notre carte',
  description: v
    ? `Escalopes, poulet rôti, kamounia, tajines, pâtes et poisson frais à ${v}. Prix à jour, commande en ligne, livraison et à emporter.`
    : 'Escalopes, poulet rôti, kamounia, tajines, pâtes et poisson frais. Prix à jour, commande en ligne, livraison et à emporter.',
  chemin: '/carte',
});

export default async function PageCarte() {
  const [categories, reglages] = await Promise.all([getCarte(), getReglages()]);

  // JSON-LD Menu : prix réels lus en base, en dinars tunisiens.
  const jsonLdMenu = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Carte',
    url: urlAbsolue('/carte'),
    inLanguage: 'fr',
    hasMenuSection: categories
      .filter((categorie) => categorie.produits.length > 0)
      .map((categorie) => ({
        '@type': 'MenuSection',
        name: categorie.name,
        ...(categorie.description ? { description: categorie.description } : {}),
        hasMenuItem: categorie.produits.map((produit) => ({
          '@type': 'MenuItem',
          name: produit.name,
          ...(produit.description ? { description: produit.description } : {}),
          offers: {
            '@type': 'Offer',
            price: (produit.priceMillimes / 1000).toFixed(3),
            priceCurrency: 'TND',
            availability: estEpuise(produit)
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          },
        })),
      })),
  };

  return (
    <div className="conteneur py-14">
      <JsonLd donnees={jsonLdMenu} />
      <JsonLd donnees={jsonLdFilAriane([{ nom: 'La carte', chemin: '/carte' }])} />

      <p className="surtitre">La carte</p>
      <h1 className="mt-4 max-w-4xl">
        Tout ce qu’on sert{v ? `, à ${v}` : ''}
      </h1>
      <p className="mt-6 max-w-lecture text-lg text-encre/75">
        Les plats arrivent complets, avec leurs pâtes, leurs frites et leurs salades. Les poissons
        entiers sont vendus au kilo et pesés avant cuisson. Les prix affichés ici sont ceux du jour.
      </p>

      {!reglages.isOpenForOrders && (
        <p className="mt-8 border border-harissa bg-harissa/5 p-4 text-sm text-harissa">
          Les commandes en ligne sont momentanément fermées. La carte reste consultable.
        </p>
      )}

      <MenuBrowser categories={categories} ouvert={reglages.isOpenForOrders} />
    </div>
  );
}
