import { getReglages } from '@/lib/settings';

/** Bandeau d'annonce, piloté depuis /admin/reglages. Masqué s'il est vide. */
export default async function AnnouncementBar() {
  const reglages = await getReglages();
  const annonce = reglages.announcement?.trim();

  if (!annonce && reglages.isOpenForOrders) return null;

  if (!reglages.isOpenForOrders) {
    return (
      <div className="bg-harissa text-white">
        <div className="conteneur py-2 text-center text-sm font-semibold">
          {annonce || 'Nous ne prenons pas de commandes en ligne pour le moment.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-encre text-chaux">
      <div className="conteneur py-2 text-center text-sm">{annonce}</div>
    </div>
  );
}
