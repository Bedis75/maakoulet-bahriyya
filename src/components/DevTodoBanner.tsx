import { champsManquants, DONNEES_DEMONSTRATION } from '@/lib/site';

/**
 * Rappel de ce qui n'a pas encore été fourni par le client.
 * Visible UNIQUEMENT en développement — jamais en production, pour que la
 * présentation au client reste propre.
 */
export default function DevTodoBanner() {
  if (process.env.NODE_ENV !== 'development') return null;

  const manquants = champsManquants();
  if (manquants.length === 0) return null;

  if (DONNEES_DEMONSTRATION) {
    return (
      <div className="border-b-2 border-harissa bg-harissa/10 text-encre">
        <div className="conteneur py-2 text-xs">
          <p className="font-mono uppercase tracking-[0.12em] text-harissa">
            Développement — mode démonstration : les données affichées sont fictives
          </p>
          <p className="mt-1">
            Adresse, téléphone, horaires, réseaux, avis et textes sont inventés. À remplacer
            avant toute mise en ligne : voir <code className="font-mono">DONNEES-A-OBTENIR.md</code>{' '}
            · interrupteur <code className="font-mono">DONNEES_DEMONSTRATION</code> dans{' '}
            <code className="font-mono">src/lib/site.ts</code>.
          </p>
        </div>
      </div>
    );
  }

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
