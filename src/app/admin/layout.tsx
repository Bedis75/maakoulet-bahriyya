import type { Metadata } from 'next';
import Link from 'next/link';

import { deconnexionAction } from '@/app/admin/actions';
import AdminNav from '@/components/admin/AdminNav';
import Wordmark from '@/components/Wordmark';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Administration', template: '%s · Administration' },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Sans session, on rend la page telle quelle : c'est le cas de /admin/login.
 * Toutes les autres URL sont filtrées en amont par le middleware, et chaque
 * page ou action appelle en plus exigerSession().
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-chaux">
      <header className="bg-encre text-chaux">
        <div className="conteneur flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="shrink-0" aria-label="Tableau de bord">
              <Wordmark taille="pied" clair />
            </Link>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-sel/55">
              Administration
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-sel/80 underline underline-offset-4 hover:text-chaux">
              Voir le site
            </Link>
            <form action={deconnexionAction}>
              <button type="submit" className="bouton bouton-clair px-3 py-2 text-xs">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminNav />

      <div className="conteneur py-8">{children}</div>
    </div>
  );
}
