import type { Metadata } from 'next';

import FormulaireReglages from '@/components/admin/FormulaireReglages';
import { exigerSession } from '@/lib/auth';
import { getReglages } from '@/lib/settings';

export const metadata: Metadata = { title: 'Réglages' };

export default async function PageReglages() {
  await exigerSession();
  const reglages = await getReglages();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="surtitre">Réglages</p>
        <h1 className="mt-3 text-3xl">Commandes et livraison</h1>
        <p className="mt-3 text-sm text-encre/65">
          Ces réglages s’appliquent immédiatement au site public.
        </p>
      </div>

      <FormulaireReglages reglages={reglages} />

      <div className="carte p-6 text-sm text-encre/70">
        <h2 className="text-lg text-encre">Ce qui ne se change pas ici</h2>
        <p className="mt-3">
          L’adresse, le téléphone, les horaires et les liens des réseaux sociaux sont dans le
          fichier <code className="font-mono">src/lib/site.ts</code>. Ils demandent une petite
          intervention technique — demandez-la, c’est l’affaire de deux minutes.
        </p>
      </div>
    </div>
  );
}
