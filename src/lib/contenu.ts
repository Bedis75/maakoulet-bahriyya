/**
 * ---------------------------------------------------------------------------
 *  Textes éditoriaux — à écrire AVEC le client (voir l'annexe du cahier des
 *  charges, questions 23 à 25).
 * ---------------------------------------------------------------------------
 *  Tout ce qui est marqué `provisoire: true` s'affiche avec une mention
 *  « texte provisoire » et doit être remplacé avant la mise en ligne.
 *  Les avis clients sont volontairement vides : on ne publie pas d'avis inventé.
 * ---------------------------------------------------------------------------
 */

export type SectionEditoriale = {
  titre: string;
  paragraphes: string[];
  /** true tant que le texte n'a pas été validé par le client. */
  provisoire: boolean;
};

export const contenu = {
  /** Page /le-restaurant. */
  restaurant: [
    {
      titre: 'La maison',
      provisoire: true,
      paragraphes: [
        'Ce paragraphe racontera l’histoire du restaurant : depuis quand il existe, qui l’a ouvert, ce qui a changé depuis, ce qui n’a pas bougé.',
        'Trois à quatre phrases suffisent. Le texte définitif sera écrit à partir des réponses du propriétaire (annexe, question 23).',
      ],
    },
    {
      titre: 'D’où vient le poisson',
      provisoire: true,
      paragraphes: [
        'Ce paragraphe précisera le port d’approvisionnement, la fréquence des arrivages et la relation avec les pêcheurs.',
        'C’est le texte le plus utile du site : il rassure le client et il apporte au référencement local des mots que personne d’autre n’écrit (annexe, question 24).',
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
  ] satisfies SectionEditoriale[],

  /**
   * Avis clients affichés sur l'accueil.
   * VOLONTAIREMENT VIDE : à remplir avec de vrais avis fournis par le client
   * (annexe, question 25). Format : { texte, auteur }.
   */
  avis: [] as { texte: string; auteur: string }[],

  /** Les trois arguments de l'accueil — ils, en revanche, sont sûrs. */
  arguments: [
    {
      titre: 'Arrivage quotidien',
      texte:
        'La carte suit la mer. Ce qui est pêché le matin est sur l’ardoise à midi, et quand c’est fini, c’est fini.',
    },
    {
      titre: 'Grillé à la minute',
      texte:
        'Poisson pesé devant vous, grillé à la commande, servi avec citron et huile d’olive. Rien qui attende sous une lampe.',
    },
    {
      titre: 'Livraison et à emporter',
      texte:
        'Vous commandez en ligne, nous préparons. Paiement à la livraison, en espèces.',
    },
  ],
} as const;
