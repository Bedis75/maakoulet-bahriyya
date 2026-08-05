import type { Metadata } from 'next';

import {
  aAdresse,
  aGeo,
  aHoraires,
  aTelephone,
  descriptionSite,
  estRenseigne,
  site,
  ville,
} from '@/lib/site';

/**
 * Toutes les URL absolues du site passent par ici, donc par
 * NEXT_PUBLIC_SITE_URL. Aucun domaine n'est écrit en dur dans le code.
 */
export function urlAbsolue(chemin = '/'): string {
  return new URL(chemin, site.url).toString();
}

type OptionsMeta = {
  /** Titre de la page, sans le nom du restaurant (60 caractères max au total). */
  titre: string;
  description: string;
  /** Chemin relatif, sert au canonical. */
  chemin: string;
};

export function construireMetadata({ titre, description, chemin }: OptionsMeta): Metadata {
  return {
    title: titre,
    description,
    alternates: { canonical: chemin },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: urlAbsolue(chemin),
      siteName: site.nameFr,
      title: `${titre} · ${site.nameFr}`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titre} · ${site.nameFr}`,
      description,
    },
  };
}

/** Schéma Restaurant — les champs non confirmés sont omis, jamais inventés. */
export function jsonLdRestaurant(): Record<string, unknown> {
  const donnees: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': urlAbsolue('/#restaurant'),
    name: site.nameAr,
    alternateName: site.nameFr,
    description: descriptionSite(),
    url: urlAbsolue('/'),
    servesCuisine: ['Fruits de mer', 'Cuisine tunisienne'],
    priceRange: site.priceRange,
    currenciesAccepted: 'TND',
    paymentAccepted: 'Espèces à la livraison',
    hasMenu: urlAbsolue('/carte'),
    acceptsReservations: false,
  };

  if (aAdresse()) {
    donnees.address = {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      ...(estRenseigne(site.address.postalCode) ? { postalCode: site.address.postalCode } : {}),
      addressCountry: site.address.country,
    };
  }

  if (aGeo()) {
    donnees.geo = {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    };
  }

  if (aTelephone()) donnees.telephone = site.phone;
  if (estRenseigne(site.email)) donnees.email = site.email;
  if (estRenseigne(site.googleMapsUrl)) donnees.hasMap = site.googleMapsUrl;

  if (aHoraires()) {
    donnees.openingHoursSpecification = site.hours.map((plage) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: plage.days,
      opens: plage.opens,
      closes: plage.closes,
    }));
  }

  const reseaux = [site.social.facebook, site.social.instagram].filter((lien) =>
    estRenseigne(lien),
  );
  if (reseaux.length > 0) donnees.sameAs = reseaux;

  if (site.logo) donnees.image = urlAbsolue(site.logo.src);

  const v = ville();
  if (v) {
    donnees.areaServed = { '@type': 'City', name: v };
  }

  return donnees;
}

/** Fil d'Ariane structuré, pour les pages autres que l'accueil. */
export function jsonLdFilAriane(elements: { nom: string; chemin: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ nom: 'Accueil', chemin: '/' }, ...elements].map((element, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: element.nom,
      item: urlAbsolue(element.chemin),
    })),
  };
}
