'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import {
  deplacerCategorieAction,
  modifierCategorieAction,
  supprimerCategorieAction,
  type EtatAction,
} from '@/app/admin/actions';
import ProduitFormulaire from '@/components/admin/ProduitFormulaire';
import ProduitLigne from '@/components/admin/ProduitLigne';

type Produit = {
  id: number;
  name: string;
  description: string | null;
  priceMillimes: number;
  unit: string;
  stock: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isCatchOfDay: boolean;
  categoryId: number;
};

type Categorie = {
  id: number;
  name: string;
  description: string | null;
  produits: Produit[];
};

const ETAT_INITIAL: EtatAction = null;

/** Une catégorie : ses plats, l'ajout rapide, la modification et l'ordre. */
export default function CategorieBloc({
  categorie,
  categories,
}: {
  categorie: Categorie;
  categories: { id: number; name: string }[];
}) {
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [editionOuverte, setEditionOuverte] = useState(false);
  const [enCours, demarrerTransition] = useTransition();
  const [retour, setRetour] = useState<EtatAction>(null);

  function lancer(travail: () => Promise<EtatAction>) {
    demarrerTransition(async () => {
      const resultat = await travail();
      setRetour(resultat);
      setTimeout(() => setRetour(null), 3500);
    });
  }

  return (
    <section aria-labelledby={`categorie-${categorie.id}`} className="carte">
      <header className="flex flex-wrap items-center gap-3 border-b border-sel p-4">
        <h2 id={`categorie-${categorie.id}`} className="text-xl">
          {categorie.name}
        </h2>
        <span className="prix text-xs text-encre/50">
          {categorie.produits.length} plat{categorie.produits.length > 1 ? 's' : ''}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-1">
          <button
            type="button"
            aria-label={`Monter la catégorie ${categorie.name}`}
            disabled={enCours}
            onClick={() => lancer(() => deplacerCategorieAction(categorie.id, 'haut'))}
            className="h-9 w-9 border border-sel bg-white hover:border-vague"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Descendre la catégorie ${categorie.name}`}
            disabled={enCours}
            onClick={() => lancer(() => deplacerCategorieAction(categorie.id, 'bas'))}
            className="h-9 w-9 border border-sel bg-white hover:border-vague"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setEditionOuverte((ouvert) => !ouvert)}
            className="bouton bouton-secondaire px-3 py-2 text-xs"
          >
            {editionOuverte ? 'Fermer' : 'Modifier'}
          </button>
          <button
            type="button"
            onClick={() => setAjoutOuvert((ouvert) => !ouvert)}
            className="bouton bouton-action px-3 py-2 text-xs"
          >
            {ajoutOuvert ? 'Fermer l’ajout' : 'Ajouter un plat'}
          </button>
        </div>
      </header>

      {categorie.description && (
        <p className="border-b border-sel bg-chaux p-4 text-sm text-encre/70">
          {categorie.description}
        </p>
      )}

      {retour && (
        <p
          role="status"
          className={`border-b border-sel p-3 text-sm ${
            retour.ok ? 'text-algue' : 'text-harissa'
          }`}
        >
          {retour.message}
        </p>
      )}

      {editionOuverte && (
        <div className="border-b border-sel bg-chaux p-4">
          <FormulaireCategorie
            categorie={categorie}
            nbProduits={categorie.produits.length}
            onFerme={() => setEditionOuverte(false)}
            onSupprime={() => lancer(() => supprimerCategorieAction(categorie.id))}
            enCours={enCours}
          />
        </div>
      )}

      {ajoutOuvert && (
        <div className="border-b border-sel bg-chaux p-4">
          <p className="mb-4 text-sm text-encre/70">
            Le formulaire se vide après chaque enregistrement : vous pouvez saisir toute la
            catégorie à la suite.
          </p>
          <ProduitFormulaire categories={categories} categorieParDefaut={categorie.id} />
        </div>
      )}

      {categorie.produits.length === 0 ? (
        <p className="p-6 text-sm text-encre/60">
          Aucun plat dans cette catégorie. Utilisez « Ajouter un plat ».
        </p>
      ) : (
        <ul>
          {categorie.produits.map((produit) => (
            <ProduitLigne key={produit.id} produit={produit} categories={categories} />
          ))}
        </ul>
      )}
    </section>
  );
}

function FormulaireCategorie({
  categorie,
  nbProduits,
  onFerme,
  onSupprime,
  enCours,
}: {
  categorie: Categorie;
  nbProduits: number;
  onFerme: () => void;
  onSupprime: () => void;
  enCours: boolean;
}) {
  const [etat, action] = useFormState(modifierCategorieAction, ETAT_INITIAL);
  const dejaFerme = useRef(false);

  useEffect(() => {
    if (etat?.ok && !dejaFerme.current) {
      dejaFerme.current = true;
      onFerme();
    }
  }, [etat, onFerme]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="categoryId" value={categorie.id} />

      {etat && !etat.ok && (
        <p role="alert" className="border border-harissa bg-harissa/5 p-3 text-sm text-harissa">
          {etat.message}
        </p>
      )}

      <div>
        <label htmlFor={`cat-name-${categorie.id}`} className="mb-1 block">
          Nom de la catégorie *
        </label>
        <input id={`cat-name-${categorie.id}`} name="name" defaultValue={categorie.name} required />
      </div>

      <div>
        <label htmlFor={`cat-desc-${categorie.id}`} className="mb-1 block">
          Paragraphe d’introduction
        </label>
        <textarea
          id={`cat-desc-${categorie.id}`}
          name="description"
          rows={2}
          defaultValue={categorie.description ?? ''}
          placeholder="Une ou deux phrases affichées en haut de la catégorie sur la carte."
        />
        <p className="mt-1 text-xs text-encre/55">
          Ce paragraphe compte pour le référencement : décrivez ce que contient la catégorie.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BoutonCategorie />
        <button type="button" className="bouton bouton-secondaire" onClick={onFerme}>
          Annuler
        </button>
        <button
          type="button"
          disabled={enCours}
          onClick={onSupprime}
          className="ml-auto text-sm text-harissa underline underline-offset-2"
          title={
            nbProduits > 0
              ? 'Videz d’abord la catégorie de ses plats'
              : 'Supprimer cette catégorie'
          }
        >
          Supprimer la catégorie
        </button>
      </div>
    </form>
  );
}

function BoutonCategorie() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton bouton-action" disabled={pending}>
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  );
}
