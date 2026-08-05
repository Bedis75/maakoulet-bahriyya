import { champsManquants } from '@/lib/site';

/**
 * Bandeau de rappel des informations que le client n'a pas encore fournies.
 * Visible UNIQUEMENT en développement — jamais en production.
 */
export default function DevTodoBanner() {
  if (process.env.NODE_ENV !== 'development') return null;

  const manquants = champsManquants();
  if (manquants.length === 0) return null;

  return (
    <div className="border-b-2 border-citron bg-citron/15 text-encre">
      <div className="conteneur py-2 text-xs">
        <p className="font-mono uppercase tracking-[0.12em]">
          Développement — {manquants.length} information(s) à obtenir du client
        </p>
        <p className="mt-1">
          À remplir dans <code className="font-mono">src/lib/site.ts</code> : {manquants.join(' · ')}
        </p>
      </div>
    </div>
  );
}
