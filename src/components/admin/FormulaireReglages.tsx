'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { enregistrerReglagesAction, type EtatAction } from '@/app/admin/actions';
import { millimesVersSaisie } from '@/lib/money';
import type { Reglages } from '@/lib/settings';

const ETAT_INITIAL: EtatAction = null;

export default function FormulaireReglages({ reglages }: { reglages: Reglages }) {
  const [etat, action] = useFormState(enregistrerReglagesAction, ETAT_INITIAL);

  return (
    <form action={action} className="carte space-y-6 p-6">
      {etat && (
        <p
          role="status"
          className={`border p-3 text-sm ${
            etat.ok
              ? 'border-algue bg-algue/5 text-algue'
              : 'border-harissa bg-harissa/5 text-harissa'
          }`}
        >
          {etat.message}
        </p>
      )}

      <label className="flex items-start gap-3 border border-sel bg-chaux p-4 text-sm font-normal">
        <input
          type="checkbox"
          name="isOpenForOrders"
          defaultChecked={reglages.isOpenForOrders}
          className="mt-1"
        />
        <span>
          <span className="block font-semibold">On prend les commandes</span>
          <span className="block text-encre/65">
            Décoché, le site reste consultable mais le bouton « Commander » est désactivé partout.
          </span>
        </span>
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fraisLivraison" className="mb-1 block">
            Frais de livraison (DT)
          </label>
          <input
            id="fraisLivraison"
            name="fraisLivraison"
            inputMode="decimal"
            defaultValue={millimesVersSaisie(reglages.deliveryFeeMillimes)}
            className="prix"
          />
          <p className="mt-1 text-xs text-encre/55">0 = livraison offerte.</p>
        </div>

        <div>
          <label htmlFor="minimumCommande" className="mb-1 block">
            Minimum de commande en livraison (DT)
          </label>
          <input
            id="minimumCommande"
            name="minimumCommande"
            inputMode="decimal"
            defaultValue={millimesVersSaisie(reglages.minOrderMillimes)}
            className="prix"
          />
          <p className="mt-1 text-xs text-encre/55">0 = pas de minimum.</p>
        </div>
      </div>

      <div>
        <label htmlFor="deliveryZones" className="mb-1 block">
          Zones desservies
        </label>
        <textarea
          id="deliveryZones"
          name="deliveryZones"
          rows={2}
          defaultValue={reglages.deliveryZones}
          placeholder="Centre-ville, Port, Corniche"
        />
        <p className="mt-1 text-xs text-encre/55">
          Séparées par des virgules. Elles deviennent la liste déroulante « Zone » du panier.
        </p>
      </div>

      <div>
        <label htmlFor="announcement" className="mb-1 block">
          Bandeau d’annonce
        </label>
        <input
          id="announcement"
          name="announcement"
          defaultValue={reglages.announcement ?? ''}
          maxLength={200}
          placeholder="Arrivage de crevettes royales ce matin."
        />
        <p className="mt-1 text-xs text-encre/55">
          Affiché en haut de toutes les pages. Laisser vide pour ne rien afficher.
        </p>
      </div>

      <BoutonEnregistrer />
    </form>
  );
}

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton bouton-action" disabled={pending}>
      {pending ? 'Enregistrement…' : 'Enregistrer les réglages'}
    </button>
  );
}
