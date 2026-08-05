'use client';

import { useState, useTransition } from 'react';

import {
  basculerArrivageAction,
  basculerDisponibiliteAction,
  deplacerProduitAction,
  enregistrerPrixAction,
  enregistrerStockAction,
  supprimerProduitAction,
  type EtatAction,
} from '@/app/admin/actions';
import ProduitFormulaire from '@/components/admin/ProduitFormulaire';
import { millimesVersSaisie, suffixeUnite } from '@/lib/money';

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

/**
 * Une ligne de la carte : prix et stock modifiables sur place, interrupteurs
 * « Disponible » et « Arrivage du jour », édition complète et suppression.
 */
export default function ProduitLigne({
  produit,
  categories,
}: {
  produit: Produit;
  categories: { id: number; name: string }[];
}) {
  const [enCours, demarrerTransition] = useTransition();
  const [retour, setRetour] = useState<EtatAction>(null);
  const [prix, setPrix] = useState(millimesVersSaisie(produit.priceMillimes));
  const [stock, setStock] = useState(produit.stock === null ? '' : String(produit.stock));
  const [edition, setEdition] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const epuise = !produit.isAvailable || (produit.stock !== null && produit.stock <= 0);

  function lancer(travail: () => Promise<EtatAction>) {
    demarrerTransition(async () => {
      const resultat = await travail();
      setRetour(resultat);
      setTimeout(() => setRetour(null), 3000);
    });
  }

  return (
    <li className="border-b border-sel p-4 last:border-b-0">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="min-w-[12rem] flex-1">
          <p className="font-semibold">
            {produit.name}
            {epuise && <span className="etiquette etiquette-epuise ml-2">Épuisé</span>}
            {produit.isCatchOfDay && <span className="etiquette etiquette-jour ml-2">Du jour</span>}
          </p>
          {produit.description && (
            <p className="mt-1 line-clamp-2 text-xs text-encre/60">{produit.description}</p>
          )}
        </div>

        {/* Prix modifiable en ligne */}
        <div className="w-32">
          <label htmlFor={`prix-ligne-${produit.id}`} className="mb-1 block text-xs">
            Prix (DT){suffixeUnite(produit.unit)}
          </label>
          <div className="flex gap-1">
            <input
              id={`prix-ligne-${produit.id}`}
              value={prix}
              inputMode="decimal"
              onChange={(e) => setPrix(e.target.value)}
              className="prix"
            />
            <button
              type="button"
              disabled={enCours}
              onClick={() => lancer(() => enregistrerPrixAction(produit.id, prix))}
              className="bouton bouton-action px-3 py-1 text-xs"
            >
              OK
            </button>
          </div>
        </div>

        {/* Stock modifiable en ligne */}
        <div className="w-28">
          <label htmlFor={`stock-ligne-${produit.id}`} className="mb-1 block text-xs">
            Stock
          </label>
          <div className="flex gap-1">
            <input
              id={`stock-ligne-${produit.id}`}
              value={stock}
              inputMode="numeric"
              placeholder="∞"
              onChange={(e) => setStock(e.target.value)}
              className="prix"
            />
            <button
              type="button"
              disabled={enCours}
              onClick={() => lancer(() => enregistrerStockAction(produit.id, stock))}
              className="bouton bouton-action px-3 py-1 text-xs"
            >
              OK
            </button>
          </div>
        </div>

        {/* Interrupteurs */}
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2 font-normal">
            <input
              type="checkbox"
              checked={produit.isAvailable}
              disabled={enCours}
              onChange={(e) =>
                lancer(() => basculerDisponibiliteAction(produit.id, e.target.checked))
              }
            />
            Disponible
          </label>
          <label className="flex items-center gap-2 font-normal">
            <input
              type="checkbox"
              checked={produit.isCatchOfDay}
              disabled={enCours}
              onChange={(e) => lancer(() => basculerArrivageAction(produit.id, e.target.checked))}
            />
            Du jour
          </label>
        </div>

        {/* Ordre et actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Monter ${produit.name}`}
            disabled={enCours}
            onClick={() => lancer(() => deplacerProduitAction(produit.id, 'haut'))}
            className="h-11 w-11 border border-sel bg-white hover:border-vague"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Descendre ${produit.name}`}
            disabled={enCours}
            onClick={() => lancer(() => deplacerProduitAction(produit.id, 'bas'))}
            className="h-11 w-11 border border-sel bg-white hover:border-vague"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setEdition((ouvert) => !ouvert)}
            className="bouton bouton-secondaire px-3 py-2 text-xs"
          >
            {edition ? 'Fermer' : 'Modifier'}
          </button>
        </div>
      </div>

      {retour && (
        <p
          role="status"
          className={`mt-3 text-xs ${retour.ok ? 'text-algue' : 'text-harissa'}`}
        >
          {retour.message}
        </p>
      )}

      {edition && (
        <div className="mt-5 border-t border-sel pt-5">
          <ProduitFormulaire
            categories={categories}
            produit={produit}
            onEnregistre={() => setEdition(false)}
          />

          <div className="mt-6 border-t border-sel pt-4">
            {confirmation ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-harissa">
                  Supprimer « {produit.name} » définitivement ?
                </p>
                <button
                  type="button"
                  disabled={enCours}
                  onClick={() => lancer(() => supprimerProduitAction(produit.id))}
                  className="bouton bouton-danger px-3 py-2 text-xs"
                >
                  Oui, supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmation(false)}
                  className="bouton bouton-secondaire px-3 py-2 text-xs"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmation(true)}
                className="text-sm text-harissa underline underline-offset-2"
              >
                Supprimer ce plat
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
