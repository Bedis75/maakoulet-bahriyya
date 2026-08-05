'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { creerCategorieAction, type EtatAction } from '@/app/admin/actions';

const ETAT_INITIAL: EtatAction = null;

/** Création rapide d'une catégorie, sans quitter la page. */
export default function NouvelleCategorie({ aucuneCategorie }: { aucuneCategorie: boolean }) {
  const [ouvert, setOuvert] = useState(aucuneCategorie);
  const [etat, action] = useFormState(creerCategorieAction, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);
  const premierChamp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!etat?.ok) return;
    formulaire.current?.reset();
    premierChamp.current?.focus();
  }, [etat]);

  if (!ouvert) {
    return (
      <button type="button" className="bouton bouton-secondaire" onClick={() => setOuvert(true)}>
        Nouvelle catégorie
      </button>
    );
  }

  return (
    <form ref={formulaire} action={action} className="carte space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg">Nouvelle catégorie</h2>
        {!aucuneCategorie && (
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="text-sm text-encre/60 underline underline-offset-2"
          >
            Fermer
          </button>
        )}
      </div>

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

      <div>
        <label htmlFor="nouvelle-categorie-nom" className="mb-1 block">
          Nom *
        </label>
        <input
          ref={premierChamp}
          id="nouvelle-categorie-nom"
          name="name"
          placeholder="Poissons grillés, Fruits de mer, Boissons…"
          required
        />
      </div>

      <div>
        <label htmlFor="nouvelle-categorie-description" className="mb-1 block">
          Paragraphe d’introduction
        </label>
        <textarea
          id="nouvelle-categorie-description"
          name="description"
          rows={2}
          placeholder="Une ou deux phrases affichées en haut de la catégorie."
        />
      </div>

      <BoutonCreer />
    </form>
  );
}

function BoutonCreer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton bouton-action" disabled={pending}>
      {pending ? 'Création…' : 'Créer la catégorie'}
    </button>
  );
}
