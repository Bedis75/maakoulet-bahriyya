'use client';

import { useState } from 'react';

import { messageContactSchema } from '@/lib/validation';

type Props = {
  /** Adresse e-mail du restaurant, si elle est renseignée. */
  email: string | null;
  /** Lien WhatsApp du restaurant, s'il est renseigné. */
  whatsapp: string | null;
  telephone: string | null;
};

/**
 * Formulaire de message.
 * La v1 n'embarque ni service d'envoi d'e-mails ni table de messages : le
 * formulaire compose donc le message et l'ouvre dans la messagerie du visiteur
 * (e-mail ou WhatsApp). Rien n'est perdu et rien n'est promis à tort.
 * Voir le README (« Activer un vrai envoi de messages ») pour la suite.
 */
export default function ContactForm({ email, whatsapp, telephone }: Props) {
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  if (!email && !whatsapp) {
    return (
      <div className="carte p-6">
        <h2 className="text-xl">Nous écrire</h2>
        <p className="mt-3 text-encre/75">
          Le formulaire de message sera activé dès que l’adresse e-mail du restaurant sera en
          service.
          {telephone ? ' En attendant, le téléphone reste le plus rapide.' : ''}
        </p>
        {telephone && (
          <a href={`tel:${telephone.replace(/\s+/g, '')}`} className="bouton bouton-action mt-5">
            Appeler le restaurant
          </a>
        )}
      </div>
    );
  }

  function surSoumission(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const formulaire = new FormData(evenement.currentTarget);

    const donnees = {
      nom: String(formulaire.get('nom') ?? ''),
      telephone: String(formulaire.get('telephone') ?? ''),
      email: String(formulaire.get('email') ?? ''),
      message: String(formulaire.get('message') ?? ''),
    };

    const analyse = messageContactSchema.safeParse(donnees);
    if (!analyse.success) {
      const champs: Record<string, string> = {};
      for (const probleme of analyse.error.issues) {
        const cle = probleme.path[0];
        if (typeof cle === 'string' && !champs[cle]) champs[cle] = probleme.message;
      }
      setErreurs(champs);
      return;
    }
    setErreurs({});

    const corps = [
      `Nom : ${analyse.data.nom}`,
      `Téléphone : ${analyse.data.telephone}`,
      analyse.data.email ? `E-mail : ${analyse.data.email}` : null,
      '',
      analyse.data.message,
    ]
      .filter((ligne) => ligne !== null)
      .join('\n');

    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        `Message depuis le site — ${analyse.data.nom}`,
      )}&body=${encodeURIComponent(corps)}`;
    } else if (whatsapp) {
      window.open(`${whatsapp}?text=${encodeURIComponent(corps)}`, '_blank', 'noopener');
    }
  }

  return (
    <form onSubmit={surSoumission} className="carte space-y-4 p-6">
      <h2 className="text-xl">Nous écrire</h2>
      <p className="text-sm text-encre/65">
        Votre message s’ouvrira dans {email ? 'votre messagerie' : 'WhatsApp'}, prêt à être envoyé.
      </p>

      <Champ label="Nom" nom="nom" erreur={erreurs.nom} requis>
        <input id="nom" name="nom" autoComplete="name" required />
      </Champ>

      <Champ label="Téléphone" nom="telephone" erreur={erreurs.telephone} requis>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="20 123 456"
          required
        />
      </Champ>

      <Champ label="E-mail (facultatif)" nom="email" erreur={erreurs.email}>
        <input id="email" name="email" type="email" autoComplete="email" />
      </Champ>

      <Champ label="Votre message" nom="message" erreur={erreurs.message} requis>
        <textarea id="message" name="message" rows={5} required />
      </Champ>

      <button type="submit" className="bouton bouton-action w-full">
        Envoyer le message
      </button>
    </form>
  );
}

function Champ({
  label,
  nom,
  erreur,
  requis = false,
  children,
}: {
  label: string;
  nom: string;
  erreur?: string;
  requis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={nom} className="mb-1 block">
        {label}
        {requis && <span className="text-harissa"> *</span>}
      </label>
      {children}
      {erreur && (
        <p className="mt-1 text-sm text-harissa" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}
