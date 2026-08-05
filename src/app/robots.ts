import type { MetadataRoute } from 'next';

import { urlAbsolue } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Espace privé et pages sans intérêt pour l'indexation.
        disallow: ['/admin', '/admin/', '/panier', '/commande/'],
      },
    ],
    sitemap: urlAbsolue('/sitemap.xml'),
  };
}
