# ⚠ Données à obtenir du client

> **LE SITE AFFICHE ACTUELLEMENT DES DONNÉES FICTIVES.**
>
> Adresse, téléphone, horaires, réseaux sociaux, avis clients, textes de présentation :
> **rien de tout cela ne vient du restaurant.** Ces valeurs servent uniquement à montrer
> le site complet lors d'une présentation. Elles doivent **toutes** être remplacées avant
> la moindre mise en ligne publique.
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
| `description` | « Restaurant de poissons et fruits de mer à Sousse… » | | ☐ |
| `address.street` | Avenue Hédi Chaker, face au port de pêche | | ☐ |
| `address.city` | **Sousse** — mot-clé SEO n°1, voir README §4 | | ☐ |
| `address.postalCode` | 4000 | | ☐ |
| `geo.lat` / `geo.lng` | 35.8256 / 10.6390 (port de Sousse) | | ☐ |
| `googleMapsUrl` | lien de recherche sur ces coordonnées | fiche d'établissement réelle | ☐ |
| `phone` | +216 73 000 000 | | ☐ |
| `whatsapp` | +216 20 000 000 | | ☐ |
| `email` | contact@maakoulet-bahriyya.com — **domaine non enregistré, ne reçoit rien** | | ☐ |
| `hours` | Mar–Dim, 11h30–15h00 et 18h30–23h00 | | ☐ |
| `closedDays` | Lundi | | ☐ |
| `social.facebook` | facebook.com/maakoulet.bahriyya.sousse — **compte inexistant** | | ☐ |
| `social.instagram` | instagram.com/maakoulet.bahriyya.sousse — **compte inexistant** | | ☐ |
| `logo` | `null` (logotype arabe typographique) | fichier vectoriel si le client en a un | ☐ |

## 2. Avis clients — `src/lib/contenu.ts`

Les trois avis affichés sur l'accueil sont **inventés**. Prénoms et textes fictifs.

☐ Les remplacer par de vrais avis (avec accord des personnes), ou vider le tableau `avis`
— dans ce cas le site affiche un renvoi neutre vers la fiche Google.

## 3. Textes de présentation — `src/lib/contenu.ts`

Les quatre sections de `/le-restaurant` (la maison, provenance du poisson, la cuisine,
l'équipe) sont **des textes de remplissage plausibles**, écrits sans rien savoir du
restaurant.

☐ Les réécrire avec le propriétaire. Le paragraphe sur la provenance du poisson est le plus
utile du site : il rassure le client et apporte au référencement local des mots que personne
d'autre n'écrit.

## 4. Carte, prix, stock — base de données

☐ Récupérer la carte complète : catégories, plats, descriptions, **prix réels**
☐ Pour chaque poisson : vendu **au kilo** ou **à la pièce** ?
☐ Quels plats changent selon l'arrivage du jour ?
☐ `npm run db:reset` puis saisie dans `/admin/carte`

Les 23 plats actuels sont de la démonstration (descriptions préfixées `[DÉMO]`, prix ronds).

## 5. Réglages de commande — `/admin/reglages`

| Réglage | Valeur FICTIVE | Valeur réelle | Fait |
|---|---|---|---|
| Frais de livraison | 3,000 DT | | ☐ |
| Minimum de commande | 20,000 DT | | ☐ |
| Zones livrées | Sousse centre, Khezama, Sahloul, Hammam Sousse, Port El Kantaoui | | ☐ |
| Bandeau d'annonce | « Arrivage du matin : crevettes royales et daurades. » | | ☐ |

☐ Délai de livraison annoncé
☐ Heure limite de prise de commande
☐ Paiement à la livraison uniquement, ou autre ?

## 6. Photos — `public/photos`

Les 21 photos actuelles viennent de Wikimedia Commons et **ne montrent pas les plats du
restaurant** (voir `/credits-photos`).

☐ Photos des plats — lumière du jour, les meilleures possibles
☐ Photos de la salle et de la façade
☐ Photo de l'équipe / du chef
☐ Sinon : prévoir une séance photo. C'est le poste le plus rentable du projet.
☐ Une fois les vraies photos en place : `npm run photos:purge`, puis les déposer dans
`public/photos` et renseigner le champ « Adresse de la photo » dans `/admin/carte`

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

**Contenu** — histoire du restaurant (depuis quand, par qui) · d'où vient le poisson (port,
pêcheurs, fréquence des arrivages) · avis clients à reprendre.

---

## Avant la mise en ligne — contrôle final

☐ `DONNEES_DEMONSTRATION = false` dans `src/lib/site.ts`
☐ Plus aucun `[DÉMO]` dans la base : `npm run db:reset` effectué et vraie carte saisie
☐ `npm run photos:purge` puis vraies photos installées
☐ Aucune adresse, aucun numéro, aucun prix, aucun avis inventé visible par un visiteur
☐ Mot de passe administrateur et `AUTH_SECRET` changés
☐ `NEXT_PUBLIC_SITE_URL` sur le vrai domaine
☐ Fiche Google Business créée **avec les vraies coordonnées**
