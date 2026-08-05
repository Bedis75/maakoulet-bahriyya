import type { Metadata } from 'next';

import LoginForm from '@/app/admin/login/LoginForm';
import Wordmark from '@/components/Wordmark';

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default function PageConnexion({
  searchParams,
}: {
  searchParams: { suite?: string };
}) {
  const suite =
    searchParams.suite && searchParams.suite.startsWith('/admin') ? searchParams.suite : '/admin';

  return (
    <div className="conteneur flex min-h-screen max-w-md flex-col justify-center py-16">
      <div className="mb-8 text-center">
        <Wordmark taille="grand" sousTitre />
        <h1 className="mt-6 text-2xl">Administration</h1>
        <p className="mt-2 text-sm text-encre/65">
          Espace réservé au restaurant : carte, prix, stock et commandes.
        </p>
      </div>

      <LoginForm suite={suite} />
    </div>
  );
}
