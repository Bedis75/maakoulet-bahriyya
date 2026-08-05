import type { Config } from 'tailwindcss';

/**
 * Les couleurs pointent vers les variables CSS définies dans src/app/globals.css.
 * Modifier la palette se fait donc à un seul endroit : globals.css.
 *
 * La forme `rgb(var(--x-rvb) / <alpha-value>)` est obligatoire : c'est ce qui
 * permet les opacités (text-sel/80, bg-encre/50…). Avec `var(--x)` contenant un
 * hexadécimal, Tailwind supprime ces classes sans prévenir.
 */
const canal = (nom: string) => `rgb(var(--${nom}-rvb) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        encre: canal('encre'),
        port: canal('port'),
        vague: canal('vague'),
        chaux: canal('chaux'),
        sel: canal('sel'),
        citron: canal('citron'),
        harissa: canal('harissa'),
        algue: canal('algue'),
      },
      fontFamily: {
        titre: ['var(--font-titre)'],
        texte: ['var(--font-texte)'],
        mono: ['var(--font-mono)'],
        arabe: ['var(--font-arabe)'],
      },
      borderRadius: {
        DEFAULT: '2px',
        none: '0',
        full: '9999px',
      },
      maxWidth: {
        page: '1180px',
        lecture: '65ch',
      },
    },
  },
  plugins: [],
};

export default config;
