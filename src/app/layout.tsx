import type { Metadata, Viewport } from 'next';

import '@/app/globals.css';

import AnnouncementBar from '@/components/AnnouncementBar';
import CartDrawer from '@/components/CartDrawer';
import { CartProvider } from '@/components/CartProvider';
import ChromeSite from '@/components/ChromeSite';
import DevTodoBanner from '@/components/DevTodoBanner';
import JsonLd from '@/components/JsonLd';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { jsonLdRestaurant, urlAbsolue } from '@/lib/seo';
import { descriptionSite, nomEtVille, site, ville } from '@/lib/site';

/**
 * Le contenu (carte, prix, stock, annonce) vient de la base : les pages sont
 * rendues à la demande. Un changement de prix dans /admin apparaît donc
 * immédiatement sur le site, sans redéploiement.
 */
export const dynamic = 'force-dynamic';

const v = ville();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: v
      ? `Restaurant tunisien & poisson à ${v} — ${site.nameFr}`
      : `${site.nameFr} — cuisine tunisienne & fruits de mer`,
    template: `%s · ${site.nameFr}`,
  },
  description: descriptionSite(),
  applicationName: site.nameFr,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: urlAbsolue('/'),
    siteName: site.nameFr,
    title: nomEtVille(),
    description: descriptionSite(),
  },
  twitter: {
    card: 'summary_large_image',
    title: nomEtVille(),
    description: descriptionSite(),
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: '#08202E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        {/* Polices chargées par <link> (et non next/font) — voir la charte §3. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Choix assumé de la charte : chargement par <link>, pas next/font. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=JetBrains+Mono:wght@400;600&family=Noto+Kufi+Arabic:wght@700&family=Public+Sans:wght@400;600&display=swap"
        />
      </head>
      <body>
        <JsonLd donnees={jsonLdRestaurant()} />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-citron focus:px-4 focus:py-2 focus:font-semibold"
        >
          Aller au contenu
        </a>

        <CartProvider>
          <ChromeSite
            entete={
              <>
                <DevTodoBanner />
                <AnnouncementBar />
                <SiteHeader />
              </>
            }
            pied={<SiteFooter />}
          >
            {children}
          </ChromeSite>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
