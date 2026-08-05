'use client';

import { useState, useTransition } from 'react';

import { changerStatutAction } from '@/app/admin/actions';
import { LIBELLES_STATUT, STATUTS, type Statut } from '@/lib/validation';

/** Changement de statut en un seul tap, avec confirmation visible. */
export default function SelecteurStatut({
  orderId,
  statut,
}: {
  orderId: number;
  statut: Statut;
}) {
  const [enCours, demarrerTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUTS.map((valeur) => {
          const actif = valeur === statut;
          return (
            <button
              key={valeur}
              type="button"
              disabled={enCours || actif}
              onClick={() =>
                demarrerTransition(async () => {
                  const resultat = await changerStatutAction(orderId, valeur);
                  setMessage(resultat?.message ?? null);
                  setTimeout(() => setMessage(null), 2500);
                })
              }
              className={`inline-flex min-h-[44px] flex-1 items-center justify-center whitespace-nowrap border px-3 text-xs font-semibold transition-colors sm:flex-none ${
                actif
                  ? valeur === 'CANCELLED'
                    ? 'border-harissa bg-harissa text-white'
                    : 'border-encre bg-encre text-chaux'
                  : 'border-sel bg-white hover:border-vague disabled:opacity-50'
              }`}
            >
              {LIBELLES_STATUT[valeur]}
            </button>
          );
        })}
      </div>

      {message && (
        <p role="status" className="mt-2 text-xs text-algue">
          {message}
        </p>
      )}
    </div>
  );
}
