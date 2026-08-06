import { DONNEES_DEMONSTRATION } from '@/lib/site';

/**
 * ---------------------------------------------------------------------------
 *  Textes éditoriaux — à écrire AVEC le client.
 * ---------------------------------------------------------------------------
 *  ⚠ En mode démonstration (DONNEES_DEMONSTRATION), les textes et les avis
 *  ci-dessous sont INVENTÉS : ils décrivent un restaurant imaginaire et les
 *  avis n'ont été laissés par personne. Voir DONNEES-A-OBTENIR.md.
 *
 *  Publier de faux avis clients est interdit par le droit de la consommation
 *  dans la plupart des pays : ces trois-là ne doivent jamais atteindre la
 *  production. Les remplacer par de vrais avis, ou vider le tableau.
 * ---------------------------------------------------------------------------
 */

export type SectionEditoriale = {
  titre: string;
  paragraphes: string[];
  /** true tant que le texte n'a pas été validé par le client. */
  provisoire: boolean;
};

export type Avis = { texte: string; auteur: string };

/** Textes de remplissage, plausibles mais entièrement inventés. */
const RESTAURANT_DEMO: SectionEditoriale[] = [
  {
    titre: 'La maison',
    provisoire: false,
    paragraphes: [
      'L’enseigne dit « fruits de mer », et c’est vrai : le poisson est là dès qu’il rentre. Mais on vient surtout ici pour la cuisine de tous les jours — l’escalope, le poulet rôti, la kamounia qui mijote depuis le matin.',
      'La salle est simple, le service rapide. Ce qui compte est dans l’assiette.',
    ],
  },
  {
    titre: 'Le plat complet',
    provisoire: false,
    paragraphes: [
      'Ici, un plat n’est pas une pièce de viande seule sur une assiette. Il arrive avec ses pâtes à la sauce rouge, ses frites coupées le matin, sa mechouia au thon et sa salade tunisienne.',
      'C’est la même chose en salle, à emporter ou en livraison : la barquette est compartimentée pour que rien ne se mélange en route.',
    ],
  },
  {
    titre: 'La cuisine',
    provisoire: false,
    paragraphes: [
      'Tout se cuit à la commande : l’escalope saisie, le poulet doré au four, le poisson posé sur la braise. Les pâtes finissent leur cuisson dans la sauce, jamais réchauffées.',
      'Les entrées, elles, se préparent le matin : poivrons grillés au feu et écrasés à la main pour la mechouia, tajines cuits au four et coupés en parts.',
    ],
  },
  {
    titre: 'L’équipe',
    provisoire: false,
    paragraphes: [
      'Une petite équipe : un cuisinier au grill, un second en cuisine, deux personnes en salle. On se connaît, on va vite, et on prend le temps d’expliquer ce qu’il y a de bien ce jour-là.',
    ],
  },
];

/** Structure prête, textes à écrire avec le propriétaire. */
const RESTAURANT_REEL: SectionEditoriale[] = [
  {
    titre: 'La maison',
    provisoire: true,
    paragraphes: [
      'Ce paragraphe racontera l’histoire du restaurant : depuis quand il existe, qui l’a ouvert, ce qui a changé depuis, ce qui n’a pas bougé.',
      'Trois à quatre phrases suffisent. Le texte définitif sera écrit à partir des réponses du propriétaire.',
    ],
  },
  {
    titre: 'D’où vient le poisson',
    provisoire: true,
    paragraphes: [
      'Ce paragraphe précisera le port d’approvisionnement, la fréquence des arrivages et la relation avec les pêcheurs.',
      'C’est le texte le plus utile du site : il rassure le client et il apporte au référencement local des mots que personne d’autre n’écrit.',
    ],
  },
  {
    titre: 'La cuisine',
    provisoire: true,
    paragraphes: [
      'Ce paragraphe décrira la façon de travailler : poisson pesé devant le client, grillade à la minute, cuissons et accompagnements.',
    ],
  },
  {
    titre: 'L’équipe',
    provisoire: true,
    paragraphes: [
      'Une ou deux phrases sur le chef et l’équipe en salle, avec une photo. Une photo d’équipe réelle vaut mieux que n’importe quel texte.',
    ],
  },
];

/**
 * ⚠ AVIS INVENTÉS — personne n’a écrit ces phrases.
 * À remplacer par de vrais avis, ou à vider (le site affiche alors un renvoi
 * neutre vers la fiche Google).
 */
const AVIS_DEMO: Avis[] = [
  {
    texte:
      'On choisit son poisson sur la glace, il est pesé devant vous et grillé dans la foulée. Le loup était parfait, la salade mechouia aussi.',
    auteur: 'Sonia B.',
  },
  {
    texte:
      'Commandé en livraison un vendredi soir, arrivé chaud et bien emballé. Les crevettes valent le détour, et l’addition reste raisonnable.',
    auteur: 'Karim T.',
  },
  {
    texte:
      'Adresse simple, sans chichi, où l’on mange du poisson vraiment frais. On y retourne avec la famille à chaque passage.',
    auteur: 'Leïla M.',
  },
];

export const contenu = {
  /** Page /le-restaurant. */
  restaurant: DONNEES_DEMONSTRATION ? RESTAURANT_DEMO : RESTAURANT_REEL,

  /** Avis affichés sur l'accueil. Vide hors mode démonstration. */
  avis: DONNEES_DEMONSTRATION ? AVIS_DEMO : ([] as Avis[]),

  /** Les trois arguments de l'accueil — ils, en revanche, sont sûrs. */
  arguments: [
    {
      titre: 'Le plat complet',
      texte:
        'Chaque plat part avec ses pâtes à la sauce rouge, ses frites coupées à la main, sa mechouia et sa salade. Rien à ajouter.',
    },
    {
      titre: 'Cuit à la commande',
      texte:
        'Escalope saisie, poulet rôti, poisson sur la braise. Rien qui attende sous une lampe, même en pleine heure de pointe.',
    },
    {
      titre: 'Livraison et à emporter',
      texte:
        'Vous commandez en ligne, nous préparons. Paiement à la livraison, en espèces.',
    },
  ],
} as const;
