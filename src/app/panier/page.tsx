import type { Metadata } from 'next';

import CheckoutForm from '@/app/panier/CheckoutForm';
import { construireMetadata } from '@/lib/seo';
import { getReglages, listeZones } from '@/lib/settings';
import { aTelephone, site } from '@/lib/site';

export const metadata: Metadata = {
  ...construireMetadata({
    titre: 'Votre panier',
    description: 'Validez votre commande : livraison ou vente à emporter, paiement à la livraison.',
    chemin: '/panier',
  }),
  robots: { index: false, follow: true },
};

export default async function PagePanier() {
  const reglages = await getReglages();

  return (
    <div className="conteneur py-14">
      <p className="surtitre">Commande</p>
      <h1 className="mt-4">Votre panier</h1>

      <CheckoutForm
        ouvert={reglages.isOpenForOrders}
        fraisLivraison={reglages.deliveryFeeMillimes}
        minimumCommande={reglages.minOrderMillimes}
        zones={listeZones(reglages.deliveryZones)}
        telephone={aTelephone() ? site.phone : null}
      />
    </div>
  );
}
