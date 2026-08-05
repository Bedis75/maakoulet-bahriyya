'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import {
  creerProduitAction,
  modifierProduitAction,
  type EtatAction,
} from '@/app/admin/actions';
import { millimesVersSaisie, UNITES, libelleUnite } from '@/lib/money';

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

type Props = {
  categories: { id: number; name: string }[];
  /** Catégorie pré-sélectionnée pour une création. */
  categorieParDefaut?: number;
  /** Renseigné = modification ; absent = création. */
  produit?: Produit;
  /** Appelé après un enregistrement réussi (fermeture du formulaire d'édition). */
  onEnregistre?: () => void;
};

const ETAT_INITIAL: EtatAction = null;

/**
 * Création et modification d'un plat.
 * En création, le formulaire se vide et reprend le focus après chaque
 * enregistrement : on peut saisir toute une catégorie à la suite.
 */
export default function ProduitFormulaire({
  categories,
  categorieParDefaut,
  produit,
  onEnregistre,
}: Props) {
  const enEdition = Boolean(produit);
  const [etat, action] = useFormState(
    enEdition ? modifierProduitAction : creerProduitAction,
    ETAT_INITIAL,
  );
  const formulaire = useRef<HTMLFormElement>(null);
  const premierChamp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!etat?.ok) return;
    if (enEdition) {
      onEnregistre?.();
      return;
    }
    formulaire.current?.reset();
    premierChamp.current?.focus();
  }, [etat, enEdition, onEnregistre]);

  return (
    <form ref={formulaire} action={action} className="space-y-4">
      {produit && <input type="hidden" name="productId" value={produit.id} />}

      {etat && (
        <p
          role="status"
          className={`border p-3 text-sm ${
            etat.ok ? 'border-algue bg-algue/5 text-algue' : 'border-harissa bg-harissa/5 text-harissa'
          }`}
        >
          {etat.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`name-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Nom du plat *
          </label>
          <input
            ref={premierChamp}
            id={`name-${produit?.id ?? 'nouveau'}`}
            name="name"
            defaultValue={produit?.name}
            required
            maxLength={120}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`description-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Description
          </label>
          <textarea
            id={`description-${produit?.id ?? 'nouveau'}`}
            name="description"
            rows={2}
            defaultValue={produit?.description ?? ''}
            placeholder="15 à 30 mots : ce que c’est, comment c’est cuisiné, ce qui l’accompagne."
          />
          <p className="mt-1 text-xs text-encre/55">
            C’est ce texte qui fait venir les clients depuis Google. Une phrase concrète vaut mieux
            qu’un adjectif.
          </p>
        </div>

        <div>
          <label htmlFor={`prix-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Prix en dinars *
          </label>
          <input
            id={`prix-${produit?.id ?? 'nouveau'}`}
            name="prix"
            inputMode="decimal"
            defaultValue={produit ? millimesVersSaisie(produit.priceMillimes) : ''}
            placeholder="45,500"
            required
          />
        </div>

        <div>
          <label htmlFor={`unit-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Vendu
          </label>
          <select id={`unit-${produit?.id ?? 'nouveau'}`} name="unit" defaultValue={produit?.unit ?? 'PIECE'}>
            {UNITES.map((unite) => (
              <option key={unite} value={unite}>
                {libelleUnite(unite)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`categoryId-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Catégorie *
          </label>
          <select
            id={`categoryId-${produit?.id ?? 'nouveau'}`}
            name="categoryId"
            defaultValue={produit?.categoryId ?? categorieParDefaut}
            required
          >
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`stock-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Stock
          </label>
          <input
            id={`stock-${produit?.id ?? 'nouveau'}`}
            name="stock"
            inputMode="numeric"
            defaultValue={produit?.stock ?? ''}
            placeholder="vide = illimité"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`imageUrl-${produit?.id ?? 'nouveau'}`} className="mb-1 block">
            Adresse de la photo (facultatif)
          </label>
          <input
            id={`imageUrl-${produit?.id ?? 'nouveau'}`}
            name="imageUrl"
            defaultValue={produit?.imageUrl ?? ''}
            placeholder="/photos/loup-de-mer.jpg"
          />
          <p className="mt-1 text-xs text-encre/55">
            Sans photo, un motif décoratif est affiché automatiquement.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm font-normal">
          <input
            type="checkbox"
            name="isAvailable"
            defaultChecked={produit ? produit.isAvailable : true}
          />
          Disponible à la vente
        </label>

        <label className="flex items-center gap-3 text-sm font-normal">
          <input
            type="checkbox"
            name="isCatchOfDay"
            defaultChecked={produit ? produit.isCatchOfDay : false}
          />
          Sur l’ardoise du jour
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <BoutonEnregistrer libelle={enEdition ? 'Enregistrer les modifications' : 'Ajouter le plat'} />
        {enEdition && onEnregistre && (
          <button type="button" className="bouton bouton-secondaire" onClick={onEnregistre}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

function BoutonEnregistrer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton bouton-action" disabled={pending}>
      {pending ? 'Enregistrement…' : libelle}
    </button>
  );
}
