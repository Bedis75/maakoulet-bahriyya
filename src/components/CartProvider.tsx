'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const CLE_STOCKAGE = 'mb_panier_v1';

export type LignePanier = {
  productId: number;
  slug: string;
  name: string;
  unit: string;
  /** Prix connu du navigateur — TOUJOURS revalidé côté serveur à la commande. */
  priceMillimes: number;
  quantity: number;
};

type ContextePanier = {
  lignes: LignePanier[];
  /** false tant que le contenu n'a pas été relu depuis localStorage. */
  charge: boolean;
  nbArticles: number;
  sousTotal: number;
  ajouter: (ligne: Omit<LignePanier, 'quantity'>, quantite?: number) => void;
  definirQuantite: (productId: number, quantite: number) => void;
  retirer: (productId: number) => void;
  vider: () => void;
  /** Remplace le panier après une revalidation serveur (prix modifié, rupture). */
  remplacer: (lignes: LignePanier[]) => void;
  tiroirOuvert: boolean;
  ouvrirTiroir: () => void;
  fermerTiroir: () => void;
};

const Contexte = createContext<ContextePanier | null>(null);

function lireStockage(): LignePanier[] {
  if (typeof window === 'undefined') return [];
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return [];
    const donnees: unknown = JSON.parse(brut);
    if (!Array.isArray(donnees)) return [];
    return donnees.filter(
      (l): l is LignePanier =>
        typeof l === 'object' &&
        l !== null &&
        typeof (l as LignePanier).productId === 'number' &&
        typeof (l as LignePanier).quantity === 'number' &&
        (l as LignePanier).quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lignes, setLignes] = useState<LignePanier[]>([]);
  const [charge, setCharge] = useState(false);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);

  // Relecture au montage : évite toute différence entre rendu serveur et client.
  useEffect(() => {
    setLignes(lireStockage());
    setCharge(true);
  }, []);

  useEffect(() => {
    if (!charge) return;
    try {
      window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(lignes));
    } catch {
      /* stockage plein ou navigation privée : on continue sans persistance */
    }
  }, [lignes, charge]);

  const ajouter = useCallback((ligne: Omit<LignePanier, 'quantity'>, quantite = 1) => {
    setLignes((actuelles) => {
      const existante = actuelles.find((l) => l.productId === ligne.productId);
      if (existante) {
        return actuelles.map((l) =>
          l.productId === ligne.productId ? { ...l, ...ligne, quantity: l.quantity + quantite } : l,
        );
      }
      return [...actuelles, { ...ligne, quantity: quantite }];
    });
  }, []);

  const definirQuantite = useCallback((productId: number, quantite: number) => {
    setLignes((actuelles) =>
      quantite <= 0
        ? actuelles.filter((l) => l.productId !== productId)
        : actuelles.map((l) => (l.productId === productId ? { ...l, quantity: quantite } : l)),
    );
  }, []);

  const retirer = useCallback((productId: number) => {
    setLignes((actuelles) => actuelles.filter((l) => l.productId !== productId));
  }, []);

  const vider = useCallback(() => setLignes([]), []);
  const remplacer = useCallback((nouvelles: LignePanier[]) => setLignes(nouvelles), []);

  const valeur = useMemo<ContextePanier>(() => {
    const nbArticles = lignes.reduce((total, l) => total + l.quantity, 0);
    const sousTotal = lignes.reduce((total, l) => total + l.priceMillimes * l.quantity, 0);
    return {
      lignes,
      charge,
      nbArticles,
      sousTotal,
      ajouter,
      definirQuantite,
      retirer,
      vider,
      remplacer,
      tiroirOuvert,
      ouvrirTiroir: () => setTiroirOuvert(true),
      fermerTiroir: () => setTiroirOuvert(false),
    };
  }, [lignes, charge, tiroirOuvert, ajouter, definirQuantite, retirer, vider, remplacer]);

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function usePanier(): ContextePanier {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error('usePanier doit être utilisé à l’intérieur de CartProvider.');
  return contexte;
}
