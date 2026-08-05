import Link from 'next/link';

export default function PageIntrouvable() {
  return (
    <div className="conteneur flex min-h-[60vh] max-w-2xl flex-col justify-center py-20">
      <p className="surtitre">Erreur 404</p>
      <h1 className="mt-4">Cette page n’existe pas</h1>
      <p className="mt-6 text-lg text-encre/75">
        Le lien est peut-être ancien, ou la page a été déplacée. La carte, elle, est toujours à jour.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/carte" className="bouton bouton-action">
          Voir la carte
        </Link>
        <Link href="/" className="bouton bouton-secondaire">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
