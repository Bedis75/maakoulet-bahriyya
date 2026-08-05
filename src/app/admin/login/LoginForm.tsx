'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { connexionAction, type EtatAction } from '@/app/admin/actions';

const ETAT_INITIAL: EtatAction = null;

export default function LoginForm({ suite }: { suite: string }) {
  const [etat, action] = useFormState(connexionAction, ETAT_INITIAL);

  return (
    <form action={action} className="carte space-y-4 p-6">
      <input type="hidden" name="suite" value={suite} />

      {etat && !etat.ok && (
        <p role="alert" className="border border-harissa bg-harissa/5 p-3 text-sm text-harissa">
          {etat.message}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block">
          Adresse e-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>

      <div>
        <label htmlFor="motDePasse" className="mb-1 block">
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <BoutonConnexion />
    </form>
  );
}

function BoutonConnexion() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton bouton-action w-full" disabled={pending}>
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  );
}
