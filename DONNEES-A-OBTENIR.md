# ⚠ Données à obtenir du client

> **LE SITE AFFICHE ACTUELLEMENT DES DONNÉES FICTIVES.**
>
> Adresse, téléphone, horaires, réseaux sociaux, avis clients, textes de présentation :
> **rien de tout cela ne vient du restaurant.** Ces valeurs servent uniquement à montrer
> le site complet lors d'une présentation. Elles doivent **toutes** être remplacées avant
> la moindre mise en ligne publique.
>
> **Seule exception : la ville, l'Ariana, est confirmée.** Elle est donc renseignée dans les
> deux jeux de valeurs et survivra au passage en mode réel. La rue, le code postal et les
> coordonnées GPS, eux, restent inventés.
>
> Interrupteur : `DONNEES_DEMONSTRATION` dans [`src/lib/site.ts`](src/lib/site.ts).
> Le passer à `false` fait réapparaître les marqueurs « À CONFIRMER » et masque proprement
> tout ce qui n'est pas renseigné.

## Pourquoi c'est sérieux

| Risque | Conséquence |
|---|---|
| Adresse fictive en ligne | des clients se déplacent chez quelqu'un d'autre |
| Téléphone fictif | appels chez un tiers ; commandes perdues |
| Fiche Google créée sur ces données | le référencement local se construit sur une fausse adresse, très difficile à corriger ensuite |
| Avis clients inventés | interdit par le droit de la consommation dans la plupart des pays ; sanctions et déréférencement |
| Horaires faux | avis négatifs de clients venus porte close |

---

## 1. Identité — `src/lib/site.ts`

| Champ | Valeur FICTIVE affichée | Valeur réelle | Fait |
|---|---|---|---|
| `legalName` | Maakoulet Bahriyya SARL | | ☐ |
| `description` | « Cuisine tunisienne et fruits de mer à Ariana… » | | ☐ |
| `address.street` | Avenue Habib Bourguiba — **inventée** | | ☐ |
| `address.city` | **Ariana** — ✔ CONFIRMÉ par le client. Mot-clé SEO n°1, voir README §4 | ✔ | ✔ |
| `address.postalCode` | 2080 (Ariana ville) — à confirmer selon le quartier | | ☐ |
| `geo.lat` / `geo.lng` | 36.8625 / 10.1956 (centre de l’Ariana, pas l’adresse réelle) | | ☐ |
| `googleMapsUrl` | lien de recherche sur ces coordonnées | fiche d'établissement réelle | ☐ |
| `phone` | +216 71 000 000 (indicatif du Grand Tunis) | | ☐ |
| `whatsapp` | +216 20 000 000 | | ☐ |
| `email` | contact@maakoulet-bahriyya.com — **domaine non enregistré, ne reçoit rien** | | ☐ |
| `hours` | Mar–Dim, 11h30–15h00 et 18h30–23h00 | | ☐ |
| `closedDays` | Lundi | | ☐ |
| `social.facebook` | facebook.com/maakoulet.bahriyya.ariana — **compte inexistant** | | ☐ |
| `social.instagram` | instagram.com/maakoulet.bahriyya.ariana — **compte inexistant** | | ☐ |
| `logo` | `null` (logotype arabe typographique) | fichier vectoriel si le client en a un | ☐ |

## 2. Avis clients — `src/lib/contenu.ts`

Les trois avis affichés sur l'accueil sont **inventés**. Prénoms et textes fictifs.

☐ Les remplacer par de vrais avis (avec accord des personnes), ou vider le tableau `avis`
— dans ce cas le site affiche un renvoi neutre vers la fiche Google.

## 3. Textes de présentation — `src/lib/contenu.ts`

Les quatre sections de `/le-restaurant` (la maison, le plat complet, la cuisine, l'équipe)
sont **des textes de remplissage plausibles**, écrits d'après les photos et sans rien savoir
de l'histoire du restaurant.

☐ Les réécrire avec le propriétaire : depuis quand, par qui, ce qui fait la maison
☐ D'où viennent les produits — l'Ariana n'est pas sur la côte : le poisson arrive du marché
de gros ou de La Goulette. Le dire précisément rassure le client et apporte au référencement
local des mots que personne d'autre n'écrit.

## 4. Carte, prix, stock — base de données

**Les plats sont désormais les vrais** : 25 plats en 6 catégories, reconstruits d'après les
17 photos fournies par le restaurant (escalopes, poulet rôti, kamounia, tajines, pâtes, riz
djerbien, poisson). Restent à obtenir :

☐ **LES PRIX — tous fictifs.** Valeurs rondes provisoires, à remplacer une par une dans
`/admin/carte`
☐ Les descriptions ont été écrites d'après les photos : **à faire valider**, elles peuvent
contenir des erreurs (composition, accompagnements)
☐ Mode de vente à confirmer : loup, sardines et crevettes sont au **kilo**, le reste à la
**portion** — est-ce juste ?
☐ Plats manquants ? La carte ne contient que ce que montrent les photos
☐ Quels plats changent selon l'arrivage / le jour de la semaine ?
☐ Le « Tajine El Bey » se commande-t-il vraiment à l'avance ? Les toasts sont-ils bien
vendus à la douzaine ?

## 5. Réglages de commande — `/admin/reglages`

| Réglage | Valeur FICTIVE | Valeur réelle | Fait |
|---|---|---|---|
| Frais de livraison | 3,000 DT | | ☐ |
| Minimum de commande | 20,000 DT | | ☐ |
| Zones livrées | Ariana centre, Ennasr, Menzah, Borj Louzir, Riadh Landlous, La Soukra | | ☐ |
| Bandeau d'annonce | « Aujourd'hui : dorade grillée et riz djerbien. » | | ☐ |

☐ Délai de livraison annoncé
☐ Heure limite de prise de commande
☐ Paiement à la livraison uniquement, ou autre ?

## 6. Photos — `public/photos`

**16 photos sont celles du restaurant** et montrent ses vrais plats. ✔

**5 photos restent empruntées** (Wikimedia Commons, licences libres) pour les poissons dont
le restaurant n'a pas encore de photo : loup de mer, sardines grillées, crevettes royales,
calamars frits, poulpe grillé. Elles sont créditées sur `/credits-photos`, et le lien du pied
de page disparaîtra tout seul quand elles seront remplacées.

☐ Photographier ces 5 poissons — c'est tout ce qui manque côté plats
☐ Photos de la salle et de la façade
☐ Photo de l'équipe / du chef
☐ Une fois faites : déposer les fichiers dans `public/photos`, renseigner le champ
« Adresse de la photo » dans `/admin/carte`, puis `npm run photos:purge` pour retirer les
photos empruntées et leurs crédits

> `npm run photos:purge` ne touche **que** les fichiers listés dans `credits.json`.
> Les photos du restaurant ne risquent rien.

**Deux photos fournies ne sont pas utilisées** et restent disponibles :
`plat-escalope-salle.jpg` (le plat servi en salle, très bonne photo d'ambiance) et une
seconde vue de la kamounia. À placer si besoin sur `/le-restaurant`.

## 7. Compte administrateur

☐ Changer `ADMIN_EMAIL` et `ADMIN_PASSWORD` — la valeur actuelle (`Admin1234!`) est publique
sur GitHub via `.env.example`
☐ Générer un vrai `AUTH_SECRET` : `openssl rand -base64 32`

## 8. Domaine et hébergement

☐ Un nom de domaine est-il déjà réservé ? Chez quel registrar, à quel nom ?
☐ Validation du `.com` proposé — inclure la ville (voir README §5)
☐ Souhaite-t-il aussi un `.tn` ? Si oui : registre de commerce + CIN du gérant
☐ Adresse e-mail professionnelle sur le domaine (`contact@…`)
☐ `NEXT_PUBLIC_SITE_URL` sur Vercel + base Postgres

---

## À envoyer au client

**Identité** — nom exact tel qu'il doit apparaître (l'enseigne est-elle uniquement
مأكولات بحرية, ou y a-t-il un nom propre en plus ?) · raison sociale et matricule fiscal ·
registre de commerce + CIN du gérant si un `.tn` est envisagé · logo existant · une phrase
qui décrit le restaurant.

**Coordonnées** — adresse complète + code postal · lien exact de la fiche Google Maps ·
téléphone(s), WhatsApp, e-mail · pages Facebook et Instagram.

**Horaires** — horaires par jour · jour de fermeture · service continu ou coupure.

**Commande** — zones livrées et frais par zone · minimum de commande · délai annoncé ·
heure limite · moyens de paiement.

**Carte** — carte complète avec prix · au kilo ou à la pièce pour chaque poisson · plats qui
changent selon l'arrivage · plats à mettre en avant.

**Photos** — plats, salle, façade, équipe.

**Contenu** — histoire du restaurant (depuis quand, par qui) · d'où viennent les produits, et
le poisson en particulier (marché de gros, La Goulette, fréquence des arrivages) · avis
clients à reprendre.

---

## Avant la mise en ligne — contrôle final

☐ `DONNEES_DEMONSTRATION = false` dans `src/lib/site.ts`
☐ **Tous les prix remplacés par les vrais** dans `/admin/carte`
☐ Descriptions des plats validées par le restaurant
☐ Les 5 poissons photographiés, puis `npm run photos:purge`
☐ Aucune adresse, aucun numéro, aucun prix, aucun avis inventé visible par un visiteur
☐ Mot de passe administrateur et `AUTH_SECRET` changés
☐ `NEXT_PUBLIC_SITE_URL` sur le vrai domaine
☐ Fiche Google Business créée **avec les vraies coordonnées**
