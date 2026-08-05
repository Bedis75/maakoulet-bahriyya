import type { MetadataRoute } from 'next';

import { urlAbsolue } from '@/lib/seo';

/** Sitemap dynamique — l'URL de base vient toujours de NEXT_PUBLIC_SITE_URL. */
export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();

  return [
    { chemin: '/', priorite: 1, frequence: 'daily' as const },
    { chemin: '/carte', priorite: 0.9, frequence: 'daily' as const },
    { chemin: '/le-restaurant', priorite: 0.6, frequence: 'monthly' as const },
    { chemin: '/contact', priorite: 0.6, frequence: 'monthly' as const },
  ].map((page) => ({
    url: urlAbsolue(page.chemin),
    lastModified: maintenant,
    changeFrequency: page.frequence,
    priority: page.priorite,
  }));
}
