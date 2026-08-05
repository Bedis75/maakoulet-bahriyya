import Image from 'next/image';

type Props = {
  imageUrl?: string | null;
  /** Sert d'alt à la photo et de graine au motif de repli. */
  nom: string;
  /** Slug de catégorie : détermine le motif utilisé faute de photo. */
  categorie?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Photo du plat, ou — tant que le client n'a pas envoyé ses photos — un motif
 * SVG dérivé de la palette. Jamais de bloc gris, jamais d'image piochée
 * ailleurs : le site doit être présentable avant la première photo.
 */
export default function DishImage({
  imageUrl,
  nom,
  categorie = '',
  className = '',
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
}: Props) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-sel ${className}`}>
        <Image
          src={imageUrl}
          alt={nom}
          fill
          sizes={sizes}
          priority={priority}
          className="zoom-photo object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <div className="zoom-photo h-full w-full">
        <MotifDeRepli categorie={categorie} nom={nom} />
      </div>
    </div>
  );
}

/** Choix du motif : écailles, vagues, filet ou bulles selon la catégorie. */
function variante(categorie: string, nom: string): 'ecailles' | 'vagues' | 'filet' | 'bulles' {
  const c = categorie.toLowerCase();
  if (c.includes('poisson')) return 'ecailles';
  if (c.includes('fruits-de-mer') || c.includes('fruits')) return 'bulles';
  if (c.includes('entree') || c.includes('accompagnement') || c.includes('dessert')) return 'filet';
  if (c.includes('boisson') || c.includes('plat')) return 'vagues';
  // Sans catégorie : on répartit de façon stable d'après le nom du plat.
  const somme = [...nom].reduce((total, lettre) => total + lettre.charCodeAt(0), 0);
  return (['ecailles', 'vagues', 'filet', 'bulles'] as const)[somme % 4];
}

function MotifDeRepli({ categorie, nom }: { categorie: string; nom: string }) {
  const type = variante(categorie, nom);
  // Identifiant unique et stable : deux motifs sur la même page ne se marchent pas dessus.
  const id = `motif-${type}-${[...`${categorie}${nom}`].reduce((t, l) => t + l.charCodeAt(0), 0)}`;

  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      focusable="false"
    >
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          {type === 'ecailles' && (
            <>
              <path
                d="M0 24a12 12 0 0 1 24 0M-12 12a12 12 0 0 1 24 0M12 12a12 12 0 0 1 24 0"
                fill="none"
                stroke="var(--vague)"
                strokeWidth="1.1"
                opacity="0.55"
              />
            </>
          )}
          {type === 'vagues' && (
            <path
              d="M0 12q6 -6 12 0t12 0M0 22q6 -6 12 0t12 0M0 2q6 -6 12 0t12 0"
              fill="none"
              stroke="var(--vague)"
              strokeWidth="1.1"
              opacity="0.55"
            />
          )}
          {type === 'filet' && (
            <path
              d="M0 0l24 24M24 0L0 24"
              fill="none"
              stroke="var(--vague)"
              strokeWidth="0.9"
              opacity="0.45"
            />
          )}
          {type === 'bulles' && (
            <>
              <circle cx="6" cy="6" r="3.2" fill="none" stroke="var(--vague)" strokeWidth="1" opacity="0.55" />
              <circle cx="18" cy="16" r="5" fill="none" stroke="var(--vague)" strokeWidth="1" opacity="0.4" />
              <circle cx="4" cy="19" r="1.6" fill="var(--vague)" opacity="0.3" />
            </>
          )}
        </pattern>
      </defs>
      <rect width="120" height="120" fill="var(--sel)" />
      <rect width="120" height="120" fill={`url(#${id})`} />
    </svg>
  );
}
