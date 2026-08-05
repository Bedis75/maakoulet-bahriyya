/**
 * Injection d'un bloc JSON-LD. Le contenu est sérialisé et les `<` échappés
 * pour ne pas pouvoir fermer la balise script.
 */
export default function JsonLd({ donnees }: { donnees: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(donnees).replace(/</g, '\\u003c'),
      }}
    />
  );
}
