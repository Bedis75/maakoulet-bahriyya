'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { usePanier } from '@/components/CartProvider';
import { passerCommande, revaliderPanier } from '@/app/actions/orders';
import { formatMillimes, suffixeUnite } from '@/lib/money';

type Props = {
  ouvert: boolean;
  fraisLivraison: number;
  minimumCommande: number;
  zones: string[];
  telephone: string | null;
};

type TypeCommande = 'DELIVERY' | 'PICKUP';

export default function CheckoutForm({
  ouvert,
  fraisLivraison,
  minimumCommande,
  zones,
  telephone,
}: Props) {
  const router = useRouter();
  const { lignes, charge, sousTotal, definirQuantite, retirer, remplacer, vider } = usePanier();
  const [enCours, demarrerTransition] = useTransition();

  const [type, setType] = useState<TypeCommande>('DELIVERY');
  const [avertissements, setAvertissements] = useState<string[]>([]);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [champs, setChamps] = useState<Record<string, string>>({});
  const revalide = useRef(false);

  // Revalidation à l'ouverture de la page : le client voit tout de suite si un
  // prix a changé ou si un plat est parti, au lieu de le découvrir en validant.
  useEffect(() => {
    if (!charge || revalide.current || lignes.length === 0) return;
    revalide.current = true;

    revaliderPanier(
      lignes.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        priceMillimes: l.priceMillimes,
      })),
    )
      .then((resultat) => {
        if (resultat.avertissements.length > 0) {
          setAvertissements(resultat.avertissements);
          remplacer(resultat.lignes);
        }
      })
      .catch(() => {
        /* le serveur revalidera de toute façon au moment de valider */
      });
  }, [charge, lignes, remplacer]);

  if (!charge) {
    return <p className="py-16 text-encre/60">Chargement de votre panier…</p>;
  }

  if (lignes.length === 0) {
    return (
      <div className="carte mt-10 p-10 text-center">
        <p className="text-lg">Votre panier est vide.</p>
        <Link href="/carte" className="bouton bouton-action mt-6">
          Voir la carte
        </Link>
      </div>
    );
  }

  const livraison = type === 'DELIVERY' ? fraisLivraison : 0;
  const total = sousTotal + livraison;
  const minimumNonAtteint =
    type === 'DELIVERY' && minimumCommande > 0 && sousTotal < minimumCommande;

  function surSoumission(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setMessageErreur(null);
    setChamps({});

    const formulaire = new FormData(evenement.currentTarget);
    const donnees = {
      type,
      customerName: String(formulaire.get('customerName') ?? ''),
      phone: String(formulaire.get('phone') ?? ''),
      address: String(formulaire.get('address') ?? ''),
      city: String(formulaire.get('city') ?? ''),
      slot: String(formulaire.get('slot') ?? ''),
      note: String(formulaire.get('note') ?? ''),
      lignes: lignes.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    };

    demarrerTransition(async () => {
      const resultat = await passerCommande(donnees);

      if (resultat.ok) {
        vider();
        router.push(`/commande/${resultat.reference}`);
        return;
      }

      setMessageErreur(resultat.message);
      setChamps(resultat.champs ?? {});
      if (resultat.panierCorrige) {
        remplacer(resultat.panierCorrige);
        setAvertissements([]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return (
    <form onSubmit={surSoumission} className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      {/* ------------------------------------------------ Colonne de gauche */}
      <div className="space-y-10">
        {(messageErreur || avertissements.length > 0) && (
          <div
            role="alert"
            className={`border p-4 text-sm ${
              messageErreur
                ? 'border-harissa bg-harissa/5 text-harissa'
                : 'border-citron bg-citron/10 text-encre'
            }`}
          >
            {messageErreur && <p className="font-semibold">{messageErreur}</p>}
            {avertissements.map((avertissement) => (
              <p key={avertissement}>{avertissement}</p>
            ))}
          </div>
        )}

        {/* Récapitulatif */}
        <section aria-labelledby="titre-articles">
          <h2 id="titre-articles" className="text-xl">
            Votre commande
          </h2>
          <ul className="mt-4 divide-y divide-sel border-y border-sel">
            {lignes.map((ligne) => (
              <li key={ligne.productId} className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{ligne.name}</p>
                  <p className="prix text-sm text-encre/60">
                    {formatMillimes(ligne.priceMillimes)}
                    {suffixeUnite(ligne.unit)}
                  </p>
                </div>

                <div className="flex items-center border border-sel bg-white">
                  <button
                    type="button"
                    className="h-10 w-10 text-lg leading-none hover:bg-sel"
                    onClick={() => definirQuantite(ligne.productId, ligne.quantity - 1)}
                    aria-label={`Diminuer la quantité de ${ligne.name}`}
                  >
                    −
                  </button>
                  <span className="prix w-10 text-center text-sm">{ligne.quantity}</span>
                  <button
                    type="button"
                    className="h-10 w-10 text-lg leading-none hover:bg-sel"
                    onClick={() => definirQuantite(ligne.productId, ligne.quantity + 1)}
                    aria-label={`Augmenter la quantité de ${ligne.name}`}
                  >
                    +
                  </button>
                </div>

                <p className="prix w-28 text-right font-semibold">
                  {formatMillimes(ligne.priceMillimes * ligne.quantity)}
                </p>

                <button
                  type="button"
                  onClick={() => retirer(ligne.productId)}
                  className="text-sm text-harissa underline underline-offset-2"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Mode de retrait */}
        <fieldset>
          <legend className="text-xl font-bold">Comment récupérer la commande</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ChoixType
              valeur="DELIVERY"
              actuel={type}
              onChange={setType}
              titre="Livraison"
              detail={
                fraisLivraison > 0
                  ? `Frais : ${formatMillimes(fraisLivraison)}`
                  : 'Frais de livraison offerts'
              }
            />
            <ChoixType
              valeur="PICKUP"
              actuel={type}
              onChange={setType}
              titre="À emporter"
              detail="Vous venez chercher la commande"
            />
          </div>
        </fieldset>

        {/* Coordonnées */}
        <section aria-labelledby="titre-coordonnees" className="space-y-4">
          <h2 id="titre-coordonnees" className="text-xl">
            Vos coordonnées
          </h2>

          <Champ label="Nom et prénom" nom="customerName" erreur={champs.customerName} requis>
            <input id="customerName" name="customerName" autoComplete="name" required />
          </Champ>

          <Champ label="Téléphone" nom="phone" erreur={champs.phone} requis>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="20 123 456"
              required
            />
          </Champ>

          {type === 'DELIVERY' && (
            <>
              <Champ label="Adresse de livraison" nom="address" erreur={champs.address} requis>
                <input
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  placeholder="Rue, immeuble, étage, repère"
                  required
                />
              </Champ>

              <Champ label="Zone" nom="city" erreur={champs.city} requis>
                {zones.length > 0 ? (
                  <select id="city" name="city" required defaultValue="">
                    <option value="" disabled>
                      Choisissez votre zone
                    </option>
                    {zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input id="city" name="city" autoComplete="address-level2" required />
                )}
              </Champ>
            </>
          )}

          <Champ label="Créneau souhaité (facultatif)" nom="slot" erreur={champs.slot}>
            <input id="slot" name="slot" placeholder="Ce midi, ce soir vers 20 h…" />
          </Champ>

          <Champ label="Précisions (facultatif)" nom="note" erreur={champs.note}>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Cuisson, sans piment, code de l’immeuble…"
            />
          </Champ>
        </section>
      </div>

      {/* ------------------------------------------------- Colonne de droite */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="carte p-6">
          <h2 className="text-xl">Total</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt>Sous-total</dt>
              <dd className="prix">{formatMillimes(sousTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{type === 'DELIVERY' ? 'Livraison' : 'À emporter'}</dt>
              <dd className="prix">
                {type === 'PICKUP' || livraison === 0 ? '—' : formatMillimes(livraison)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-sel pt-3 text-base font-bold">
              <dt>À payer</dt>
              <dd className="prix">{formatMillimes(total)}</dd>
            </div>
          </dl>

          {minimumNonAtteint && (
            <p className="mt-4 border border-harissa bg-harissa/5 p-3 text-sm text-harissa">
              Minimum de commande en livraison : {formatMillimes(minimumCommande)}. Il manque{' '}
              {formatMillimes(minimumCommande - sousTotal)}.
            </p>
          )}

          {!ouvert && (
            <p className="mt-4 border border-harissa bg-harissa/5 p-3 text-sm text-harissa">
              Les commandes en ligne sont fermées pour le moment.
              {telephone && ' Vous pouvez nous appeler.'}
            </p>
          )}

          <button
            type="submit"
            className="bouton bouton-action mt-6 w-full"
            disabled={enCours || minimumNonAtteint || !ouvert}
          >
            {enCours ? 'Envoi en cours…' : 'Valider la commande'}
          </button>

          <p className="mt-4 text-xs text-encre/60">
            Paiement à la livraison, en espèces. Nous vous appelons pour confirmer avant de
            préparer.
          </p>

          {telephone && (
            <p className="mt-3 text-xs text-encre/60">
              Une question ?{' '}
              <a href={`tel:${telephone.replace(/\s+/g, '')}`} className="lien-souligne">
                {telephone}
              </a>
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}

function ChoixType({
  valeur,
  actuel,
  onChange,
  titre,
  detail,
}: {
  valeur: TypeCommande;
  actuel: TypeCommande;
  onChange: (valeur: TypeCommande) => void;
  titre: string;
  detail: string;
}) {
  const actif = actuel === valeur;
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
        actif ? 'border-encre bg-white' : 'border-sel bg-white hover:border-vague'
      }`}
    >
      <input
        type="radio"
        name="type"
        value={valeur}
        checked={actif}
        onChange={() => onChange(valeur)}
        className="mt-1"
      />
      <span>
        <span className="block font-semibold">{titre}</span>
        <span className="block text-sm font-normal text-encre/65">{detail}</span>
      </span>
    </label>
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
