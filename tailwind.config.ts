import type { Config } from 'tailwindcss';

/**
 * Les couleurs pointent vers les variables CSS définies dans src/app/globals.css.
 * Modifier la palette se fait donc à un seul endroit : globals.css.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        encre: 'var(--encre)',
        port: 'var(--port)',
        vague: 'var(--vague)',
        chaux: 'var(--chaux)',
        sel: 'var(--sel)',
        citron: 'var(--citron)',
        harissa: 'var(--harissa)',
        algue: 'var(--algue)',
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
