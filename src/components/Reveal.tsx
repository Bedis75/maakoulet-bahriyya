'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Décalage en millisecondes, pour faire apparaître une liste en cascade. */
  delai?: number;
  as?: ElementType;
};

/**
 * Apparition au scroll : translateY(12px) → 0.
 * `prefers-reduced-motion` est géré dans globals.css (aucun mouvement).
 */
export default function Reveal({ children, className = '', delai = 0, as: Balise = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVisible(true);
          observateur.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <Balise
      ref={ref}
      style={delai ? { transitionDelay: `${delai}ms` } : undefined}
      className={`revelation ${visible ? 'visible' : ''} ${className}`}
    >
      {children}
    </Balise>
  );
}
