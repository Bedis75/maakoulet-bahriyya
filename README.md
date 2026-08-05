# مأكولات بحرية — Maakoulet Bahriyya

Site web du restaurant de poissons et fruits de mer **مأكولات بحرية** : carte en ligne,
ardoise des arrivages du jour, commandes en livraison et à emporter, back-office pour le
propriétaire. Interface entièrement en français ; seule l’enseigne s’affiche en arabe.

- **Next.js 14** (App Router) + TypeScript · **Tailwind CSS 3** · **Prisma** (SQLite en dev,
  Postgres en prod) · **jose + bcryptjs** pour l’authentification · **zod** pour la validation ·
  **sharp** pour l’optimisation des images.
- Aucune librairie de composants : tout est écrit à la main.

> **`sharp` n’est pas optionnel ici.** Sans lui, Next optimise les images avec un codec
> WebAssembly qui fait planter V8 sous Windows / Node 24 (`Check failed:
> jit_page_->allocations_.erase(addr) == 1` lors du `next start`). Il est en dépendance directe :
> ne pas le retirer.

---

## 1. Installation

```bash
npm install
npm run setup      # crée .env, génère Prisma, crée la base, insère la démo
npm run dev        # http://localhost:3000
```

`npm run setup` copie `.env.example` en `.env` s’il n’existe pas. Les valeurs par défaut
suffisent pour travailler en local.

### Compte de test (créé par le seed)

| | |
|---|---|
| Adresse | `admin@maakoulet-bahriyya.local` |
| Mot de passe | `Admin1234!` |
| Connexion | http://localhost:3000/admin/login |

Ces identifiants viennent de `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env`.
**Les changer avant toute mise en ligne.**

### Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production (génère Prisma puis compile) |
| `npm run start` | serveur de production |
| `npm run setup` | installation complète en une commande |
| `npm run db:push` | applique le schéma Prisma à la base |
| `npm run db:seed` | (ré)insère le compte admin, les réglages et la **carte de démonstration** |
| `npm run db:reset` | **efface toute la démo** et les commandes ; garde le compte admin et les réglages |
| `npm run db:studio` | explorateur de base Prisma |
| `npm run typecheck` | vérification TypeScript seule |
| `npm run lint` | ESLint |

---

## 2. Le contenu n’est pas encore celui du client

Le client n’a pas fourni la carte, les prix, l’adresse, les horaires ni les photos.
Le site est donc construit pour que **tout le contenu soit remplaçable sans toucher au code**.

### ⚠ 2.0 Mode démonstration — actuellement ACTIVÉ

Pour pouvoir montrer le site complet, `DONNEES_DEMONSTRATION` vaut `true` dans
[`src/lib/site.ts`](src/lib/site.ts). **Adresse, téléphone, horaires, réseaux sociaux, avis
clients et textes de présentation affichés sont alors FICTIFS.**

👉 **[`DONNEES-A-OBTENIR.md`](DONNEES-A-OBTENIR.md) liste tout ce qui est inventé et ce qu’il
faut obtenir du client.** C’est le document de suivi du projet.

```ts
// src/lib/site.ts
export const DONNEES_DEMONSTRATION = false;   // ← avant toute mise en ligne
```

Repassé à `false`, le site retrouve son comportement de référence : les marqueurs
« À CONFIRMER » réapparaissent côté code, chaque composant masque proprement ce qui manque,
et aucun visiteur ne voit une information inventée. Un bandeau rouge le rappelle en
développement tant que le mode est actif.

### 2.1 Identité du restaurant → `src/lib/site.ts`

**Un seul fichier à éditer.** Il alimente l’en-tête, le pied de page, la page contact,
les métadonnées, le JSON-LD et le sitemap.

Tant qu’un champ vaut `À CONFIRMER`, une chaîne vide ou `0`, le composant qui l’utilise
**le masque** au visiteur — jamais de marqueur affiché en ligne. En développement, un
bandeau jaune en haut de page liste les champs qui restent à remplir.

Champs `TODO` à renseigner :

- [ ] `legalName` — raison sociale (mentions légales)
- [ ] `description` — une phrase, 150 caractères max (sert de meta description)
- [ ] `address.street` — numéro et rue
- [ ] `address.city` — **la ville : mot-clé SEO le plus important du projet** (§4)
- [ ] `address.postalCode`
- [ ] `geo.lat` / `geo.lng` — clic droit sur le point dans Google Maps
- [ ] `googleMapsUrl` — lien de la fiche d’établissement
- [ ] `phone` — numéro principal
- [ ] `whatsapp` — facultatif
- [ ] `email` — adresse professionnelle sur le domaine (§6), facultatif
- [ ] `hours` — horaires réels, une entrée par plage (alimente le JSON-LD)
- [ ] `closedDays` — jour(s) de fermeture
- [ ] `social.facebook` / `social.instagram`
- [ ] `logo` — laisser `null` pour garder le logotype arabe, sinon déposer le fichier dans
      `/public` et écrire `{ src: '/logo.svg', width: 240, height: 80 }`

### 2.2 Textes éditoriaux → `src/lib/contenu.ts`

Les paragraphes de `/le-restaurant` sont marqués `provisoire: true` et s’affichent avec la
mention « Texte provisoire — à écrire avec le restaurant ». Passer `provisoire: false` une
fois le texte validé.

Le tableau `avis` est **volontairement vide** : on ne publie pas d’avis inventé. Y coller les
vrais avis fournis par le client, ou laisser vide (le site affiche alors un renvoi vers la
fiche Google).

### 2.3 Carte, prix, stock, photos → base de données

Tout se pilote depuis `/admin` — aucun redéploiement nécessaire.

Les données du seed sont **de la démonstration** : chaque description commence par `[DÉMO]`
et les prix sont des valeurs rondes manifestement provisoires. Le jour où le client livre sa
vraie carte :

```bash
npm run db:reset     # base propre : compte admin + réglages, rien d'autre
```

puis saisie dans `/admin/carte` (création d’une catégorie, puis des plats à la suite sans
quitter la page).

### 2.4 Photos provisoires

Sans photo, un plat affiche un motif SVG dérivé de la palette (composant `DishImage`) — c’est
le comportement par défaut, et celui qu’il faut viser tant que le client n’a rien fourni.

Pour une présentation au client, `npm run photos:demo` installe des photos **empruntées** :

```bash
npm run photos:demo     # télécharge 21 photos Wikimedia Commons dans /public/photos
npm run photos:purge    # les retire et rend leur motif SVG aux plats
```

Trois choses à savoir :

1. **Ces photos ne montrent pas les plats du restaurant.** Un client qui commande d’après une
   photo qui ne correspond pas à ce qu’il reçoit a un motif de réclamation légitime.
2. Elles sont toutes sous licence autorisant la réutilisation commerciale (CC0, CC BY,
   CC BY-SA, domaine public). CC BY et CC BY-SA **exigent l’attribution** : la page
   `/credits-photos` la publie, et un lien apparaît dans le pied de page tant que ces photos
   sont en place. Ne pas supprimer cette page sans supprimer les photos.
3. **À remplacer avant la mise en ligne définitive.** De vraies photos des plats sont le poste
   qui fera le plus de différence sur ce site — voir l’annexe, questions 19 à 22.

Pour poser les vraies photos : déposer les fichiers dans `/public/photos`, puis renseigner le
champ « Adresse de la photo » de chaque plat dans `/admin/carte` (par exemple
`/photos/loup-de-mer.jpg`).

---

## 3. Back-office `/admin`

Protégé par un middleware (JWT signé, cookie `httpOnly`). Pensé mobile d’abord : le patron
l’utilise debout, en cuisine.

| Route | Ce qu’on y fait |
|---|---|
| `/admin` | commandes du jour, chiffre du jour, alertes stock bas (≤ 5), plats épuisés |
| `/admin/commandes` | liste + détail, changement de statut en un tap, filtres, tri |
| `/admin/carte` | prix et stock modifiables en ligne, interrupteurs « Disponible » et « Arrivage du jour », création / modification / suppression, ordre des plats et des catégories |
| `/admin/reglages` | frais de livraison, minimum de commande, zones desservies, ouverture des commandes, bandeau d’annonce |

Un stock vide = illimité. Un stock à 0, ou l’interrupteur « Disponible » décoché, affiche
« Épuisé » sur le site et empêche l’ajout au panier.

Toutes les mutations passent par des Server Actions avec `revalidatePath` : le changement est
visible immédiatement côté public, et chaque action renvoie un message à l’écran
(« Prix enregistré. »).

### Sécurité du tunnel de commande

Rien de ce qui vient du navigateur n’est cru sur parole. À la validation, le serveur :
relit les produits en base, refuse les plats épuisés, ajuste les quantités au stock restant,
**recalcule le total**, applique les frais et le minimum de commande, décrémente le stock dans
une transaction (décrément conditionnel : deux commandes simultanées ne peuvent pas passer le
stock sous zéro), puis crée la commande. Modifier un prix côté client ne change rien.

---

## 4. SEO

Le nom de l’enseigne est **générique** : impossible de se positionner dessus seul. Toute la
stratégie repose sur le couple **catégorie + ville** — « restaurant fruits de mer [ville] »,
« poisson grillé [ville] », « livraison poisson [ville] ».

`site.address.city` est donc le champ le plus important du projet : il apparaît dans le
`<title>` de l’accueil, dans le H1, dans le JSON-LD et dans le pied de page.

Déjà en place :

- métadonnées par page (`title`, `description`, `canonical`, Open Graph, Twitter Card) ;
- JSON-LD `Restaurant` dans le layout (nom arabe + `alternateName`, adresse, geo, téléphone,
  `openingHoursSpecification`, `servesCuisine`, `priceRange`, `hasMenu`) — les champs non
  confirmés sont **omis**, jamais inventés ;
- JSON-LD `Menu` / `MenuItem` sur `/carte`, prix réels lus en base, en `TND` ;
- `sitemap.xml` et `robots.txt` dynamiques, construits sur `NEXT_PUBLIC_SITE_URL` ;
- un seul `<h1>` par page, hiérarchie de titres correcte, `alt` partout, focus clavier
  visible, contraste AA, lisible jusqu’à 360 px de large.

### Checklist après la mise en ligne

1. **Google Business Profile** — le levier n°1 pour un restaurant. Fiche complète : catégorie
   « Restaurant de fruits de mer », horaires, photos géolocalisées, lien vers le site.
2. **Search Console** — vérifier la propriété, soumettre `https://…/sitemap.xml`.
3. **NAP identique partout** (nom, adresse, téléphone) : site, Google, Facebook, Instagram,
   annuaires. Une seule forme, au caractère près.
4. **Test des résultats enrichis** de Google sur l’accueil et sur `/carte`.
5. Remplir les descriptions de plats (15–30 mots) et les paragraphes de catégorie depuis
   `/admin/carte` : c’est là que se joue une bonne moitié du référencement.
6. Vérifier le LCP (< 2,5 s) une fois les vraies photos en place — `next/image`, dimensions
   explicites, `priority` sur le héros uniquement.

---

## 5. Mise en production (Vercel)

1. Pousser le dépôt, importer le projet dans Vercel.
2. Base **Postgres** (Neon ou Supabase) :
   - dans `prisma/schema.prisma`, remplacer `provider = "sqlite"` par `provider = "postgresql"` ;
   - variable `DATABASE_URL` = l’URL fournie par l’hébergeur ;
   - `npx prisma db push` puis `npm run db:seed` (ou `npm run db:reset` pour partir vide).
3. Variables d’environnement Vercel :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | URL Postgres |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine.com` (sans barre finale) |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | compte du propriétaire, à changer |

4. Domaine : l’ajouter dans Vercel, suivre les enregistrements DNS, SSL automatique.
5. **Choisir une seule forme canonique** (`www.exemple.com` *ou* `exemple.com`) et rediriger
   l’autre en 301. Servir les deux en 200 crée du contenu dupliqué.
6. Enregistrer le domaine pour plusieurs années, activer le verrou de transfert.

Aucun domaine n’est codé en dur : `NEXT_PUBLIC_SITE_URL` est la seule source de vérité
(canonical, sitemap, robots, Open Graph, JSON-LD). Changer de domaine = changer cette variable.

### Choisir le nom de domaine

L’enseigne étant générique, un `maakoulatbahriya.com` n’apprend rien à personne. **Inclure la
ville** — c’est le mot-clé qui compte et ça rend le domaine mémorisable :
`maakoulet-bahriyya-[ville].com`, `[ville]-fruits-de-mer.com`. Court, dictable au téléphone,
sans double tiret, sans chiffre. Vérifier en parallèle que le pseudo est libre sur Instagram
et Facebook.

### Ajouter un `.tn` plus tard

L’enregistrement passe par l’ATI ou un bureau agréé, il est réservé aux entités ayant une
adresse en Tunisie, et un dossier est exigé (registre de commerce + CIN du gérant pour une
société, CIN seule pour un particulier — qui n’a alors accès qu’au `.tn`, pas au `.com.tn`).
Un `.tn` ne peut pas être revendu. Sources : `registre.tn`, `web6.tn`.

Deux options, **jamais les deux domaines en 200** :

| Option | Mise en œuvre | Quand |
|---|---|---|
| `.tn` en redirection (recommandé) | 301 du `.tn` vers le `.com`, `NEXT_PUBLIC_SITE_URL` inchangé | protège la marque, zéro risque SEO |
| Bascule sur le `.tn` | 301 du `.com` vers le `.tn`, changer `NEXT_PUBLIC_SITE_URL`, déclarer le changement d’adresse dans Search Console, mettre à jour Google Business et les réseaux | si le client tient au signal local ; prévoir une baisse de trafic de quelques semaines |

---

## 6. E-mail professionnel et formulaire de contact

Prévoir une adresse sur le domaine (`contact@…`) plutôt qu’un Gmail : c’est ce qui s’affichera
sur le site, la fiche Google et les réseaux (Google Workspace ou Zoho Mail). `site.email` reste
vide tant que ce n’est pas fait — le site n’affiche pas d’adresse provisoire.

**Formulaire de `/contact` :** la v1 n’embarque ni service d’envoi d’e-mails ni table de
messages. Le formulaire valide la saisie puis ouvre le message pré-rempli dans la messagerie du
visiteur (`mailto:`) ou dans WhatsApp. Rien n’est perdu, rien n’est promis à tort. Si aucun des
deux canaux n’est renseigné, le formulaire est remplacé par un renvoi vers le téléphone.

Pour un envoi serveur plus tard : brancher un service (Resend, Brevo…) dans une Server Action
et remplacer l’ouverture du client de messagerie — le reste du formulaire ne bouge pas.

---

## 7. Structure du projet

```
prisma/
├─ schema.prisma       modèle de données (prix en millimes, entiers)
├─ seed.ts             compte admin + réglages + carte de DÉMONSTRATION
├─ reset.ts            npm run db:reset
└─ env.ts              chargeur .env pour les scripts

src/
├─ middleware.ts       protection de /admin (jose, runtime Edge)
├─ lib/
│  ├─ site.ts          ← LE fichier à éditer (identité du restaurant)
│  ├─ contenu.ts       textes éditoriaux, avis clients
│  ├─ prisma.ts        singleton Prisma
│  ├─ auth.ts          bcrypt + session ; auth-edge.ts pour le middleware
│  ├─ money.ts         millimes ↔ affichage « 92,000 DT »
│  ├─ catalogue.ts     lecture de la carte, règles « épuisé » / « stock bas »
│  ├─ settings.ts      réglages (frais, minimum, zones, annonce)
│  ├─ validation.ts    schémas zod, statuts de commande
│  ├─ dates.ts         journée au fuseau Africa/Tunis
│  └─ seo.ts           métadonnées, JSON-LD, URL absolues
├─ components/
│  ├─ SiteHeader · SiteFooter · Wordmark · ChromeSite
│  ├─ Ardoise          l’ardoise du jour (server component)
│  ├─ DishImage        photo, ou motif SVG de repli
│  ├─ CartProvider · CartDrawer · AddToCart · MenuBrowser
│  ├─ JsonLd · Reveal · AnnouncementBar · DevTodoBanner
│  └─ admin/           AdminNav, SelecteurStatut, formulaires de la carte
└─ app/
   ├─ layout.tsx  globals.css  page.tsx  not-found.tsx
   ├─ carte/  panier/  commande/[reference]/  le-restaurant/  contact/
   ├─ sitemap.ts  robots.ts
   ├─ actions/orders.ts        tunnel de commande (Server Action)
   └─ admin/                   login, tableau de bord, commandes, carte, réglages, actions.ts
```

**Les prix sont des entiers en millimes** (1 DT = 1000 millimes). Jamais de flottant, ni en
base, ni dans les calculs. L’affichage passe toujours par `formatMillimes()`.

---

## 8. Direction artistique

« L’ardoise du port » : le marché aux poissons, l’ardoise des arrivages, les murs à la chaux.

| Jeton | Valeur | Usage |
|---|---|---|
| `--encre` | `#08202E` | texte, sections sombres, l’ardoise |
| `--port` | `#17557E` | liens, éléments actifs |
| `--vague` | `#2E7BA6` | survol, illustrations |
| `--chaux` | `#FBFAF6` | fond de page |
| `--sel` | `#E4EBEF` | bordures, cartes |
| `--citron` | `#E8A317` | **actions uniquement** (Commander, Ajouter, Enregistrer) et badges « du jour » |
| `--harissa` | `#B23A2E` | épuisé, erreurs, annulation |
| `--algue` | `#2F7D5B` | disponible, validation |

Le citron ne sert jamais de décoration. Polices : *Bricolage Grotesque* (titres),
*Public Sans* (texte), *JetBrains Mono* (prix, poids, références), *Noto Kufi Arabic*
(logotype), chargées par `<link>` dans `layout.tsx`.

Le logotype est l’enseigne en arabe : `dir="rtl"` et `lang="ar"` **uniquement** sur cet
élément, le document reste `lang="fr" dir="ltr"`.

Animations : apparition au scroll et états de survol, rien d’autre ; `prefers-reduced-motion`
est respecté.

---

## 9. Hors périmètre v1

Paiement en ligne (Flouci / Konnect / e-Dinar), notification WhatsApp ou SMS à chaque commande,
réservation de table, version arabe complète du site, programme de fidélité, impression du
ticket en cuisine.

---

## 10. À demander au client avant la mise en ligne

**Identité** — nom exact (l’enseigne est-elle uniquement مأكولات بحرية, ou y a-t-il un nom
propre en plus ?), raison sociale et matricule fiscal, registre de commerce + CIN du gérant
(indispensables pour un `.tn`), logo existant, une phrase qui décrit le restaurant.

**Coordonnées** — adresse complète + code postal, lien exact de la fiche Google Maps,
téléphone(s) · WhatsApp · e-mail, pages Facebook / Instagram.

**Horaires** — horaires par jour, jour de fermeture, service continu ou coupure.

**Commande** — zones livrées et frais par zone, minimum de commande, délai annoncé, heure
limite de prise de commande, paiement à la livraison uniquement ou non.

**Carte** — carte complète (catégories, plats, descriptions, prix), pour chaque poisson :
vendu au kilo ou à la pièce, quels plats changent selon l’arrivage, plats à mettre en avant.

**Photos** — le poste le plus important : plats (lumière du jour), salle et façade, équipe /
chef. Sinon, prévoir une séance photo.

**Contenu éditorial** — histoire du restaurant (depuis quand, par qui), provenance du poisson
(port, pêcheurs, arrivage — excellent pour le référencement et la confiance), avis clients à
reprendre.

**Domaine** — un nom est-il déjà réservé (chez quel registrar, à quel nom) ? validation du
`.com` proposé, souhaite-t-il aussi un `.tn` ?
