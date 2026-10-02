# 🌲 Parc des Cimes — Système de réservation

Application de réservation d'activités pour un parc de loisirs, réalisée avec **Next.js 16 (App Router)** et **TypeScript**.

## Auteurs

- CHEVANCHE Kiliann

---

##  Installation et lancement

Prérequis : **Node.js 20.9+** (testé avec Node 24).

```bash
npm install
cp .env.example .env.local   # puis générer un JWT_SECRET (commande dans le fichier)
npm run db:init              # crée database.db et insère les données de démonstration
npm run dev                  # http://localhost:3000
```

> `npm run db:init` **réinitialise** la base : il peut être relancé à tout moment pour revenir aux données de départ.

### Comptes de démonstration

| Rôle           | E-mail          | Mot de passe |
| -------------- | --------------- | ------------ |
| Administrateur | `admin@parc.fr` | `Admin123!`  |
| Utilisateur    | `jean@parc.fr`  | `User1234!`  |
| Utilisateur    | `lea@parc.fr`   | `User1234!`  |

Le jeu de données contient une activité **complète** (« Kayak au coucher du soleil ») et une activité **passée**, pour tester les validations.

### Scripts

| Commande            | Rôle                                               |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Serveur de développement                           |
| `npm run build`     | Build de production (`npm start` pour le lancer)   |
| `npm run db:init`   | (Ré)initialise la base de données                  |
| `npm run typecheck` | Vérification TypeScript (avec les types de routes) |
| `npm run lint`      | ESLint                                             |

---

## 🧱 Stack technique

| Besoin           | Choix                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| Framework        | Next.js 16 — App Router, Server Components, Route Handlers (API), Proxy                 |
| Base de données  | **SQLite** avec `sqlite` + `sqlite3` (fichier `database.db`), requêtes SQL paramétrées  |
| API              | Routes `src/app/api/…/route.ts`, appelées en `fetch` (JSON) depuis les formulaires      |
| Sessions         | JWT signé avec **jose**, stocké dans un cookie `httpOnly` (`src/utils/sessions.ts`)     |
| Mots de passe    | **bcryptjs** (`src/utils/bcryptjs.ts`)                                                  |
| Validation       | **Zod** (messages d'erreur en français, mêmes règles pour toutes les routes)            |
| UI               | **Tailwind CSS v4**, **clsx**, module CSS (page 404), `next/font`, icônes lucide-react  |

### Variables d'environnement (`.env.local`)

| Variable        | Rôle                                                       |
| --------------- | ---------------------------------------------------------- |
| `DATABASE_NAME` | Fichier de la base SQLite (défaut : `database.db`)         |
| `JWT_SECRET`    | Clé de signature des sessions (obligatoire en production)  |

## 🗄️ Base de données

Le script SQL complet est dans [`db/schema.sql`](db/schema.sql) : il peut être exécuté avec `npm run db:init` ou depuis VS Code avec l'extension **SQLTools**. Le contenu de `database.db` se consulte avec l'extension **SQLite Viewer**.

- `users` : id, prenom, nom, email (unique), motdepasse (hash bcrypt), role (`user` | `admin`)
- `type_activite` : id, nom (unique)
- `activites` : id, nom, type_id → type_activite, places_disponibles, description, datetime_debut, duree (minutes)
- `reservations` : id, user_id → users, activite_id → activites, date_reservation, etat (`true` = active, `false` = annulée)

`places_disponibles` est la **capacité totale** de la session. Les places restantes sont **calculées** (capacité − réservations actives) plutôt que décrémentées : une annulation libère automatiquement une place et le compteur ne peut jamais se désynchroniser.

Les types TypeScript de chaque table sont dans [`src/types/models.ts`](src/types/models.ts) : un type « ligne SQLite » (`ActiviteRow`…) et un type « modèle » converti pour l'application (`Activite`, avec de vraies `Date`).

## 🔌 API

| Méthode | Route                      | Rôle                                  | Accès          |
| ------- | -------------------------- | ------------------------------------- | -------------- |
| POST    | `/api/register`            | Inscription (+ connexion automatique) | Tous           |
| POST    | `/api/login`               | Connexion                             | Tous           |
| POST    | `/api/logout`              | Déconnexion                           | Tous           |
| PATCH   | `/api/profil`              | Modifier prénom, nom, e-mail          | Connecté       |
| DELETE  | `/api/profil`              | Supprimer son compte (mot de passe)   | Connecté       |
| PUT     | `/api/profil/mot-de-passe` | Changer de mot de passe               | Connecté       |
| POST    | `/api/reservations`        | Réserver une activité                 | Connecté       |
| DELETE  | `/api/reservations/[id]`   | Annuler **sa** réservation            | Connecté       |
| POST    | `/api/activites`           | Créer une activité                    | Administrateur |
| PUT     | `/api/activites/[id]`      | Modifier une activité                 | Administrateur |
| DELETE  | `/api/activites/[id]`      | Supprimer une activité                | Administrateur |
| POST    | `/api/types`               | Créer un type d'activité              | Administrateur |
| PUT     | `/api/types/[id]`          | Renommer un type                      | Administrateur |
| DELETE  | `/api/types/[id]`          | Supprimer un type inutilisé           | Administrateur |

Les réponses sont en JSON : `{ message, data? }` en cas de succès, `{ message, fieldErrors? }` en cas d'erreur, avec le statut HTTP adapté (400 champs invalides, 401 non connecté, 403 interdit, 404 introuvable, 409 conflit).

Les **lectures** (listes, détails) n'ont pas besoin d'API : les pages sont des Server Components qui exécutent directement les requêtes SQL de `src/data/`.

## ✅ Fonctionnalités

**Visiteurs**
- Consultation des activités à venir, avec jauge de remplissage
- Recherche par nom et filtre par type (l'URL reste partageable : `/activites?q=kayak&type=2`)
- Page de détail d'une activité

**Utilisateurs connectés**
- Inscription, connexion, déconnexion
- Modification du profil, changement de mot de passe, suppression du compte (confirmée par mot de passe)
- Réservation d'une activité, liste de ses réservations (à venir / passées / annulées), annulation

**Administrateurs**
- Tableau de bord (chiffres clés + toutes les activités)
- Création, modification et suppression d'activités
- Liste des participants d'une activité
- Gestion des types d'activités (bonus)

## 🔒 Validations et sécurité

Chaque route API revérifie l'utilisateur **côté serveur** : une route peut être appelée directement (Postman, `curl`…), masquer un bouton dans l'interface ne suffit pas.

- **Activité complète** : la réservation est une seule requête `INSERT … SELECT … WHERE places_disponibles > (réservations actives)`. SQLite l'exécute de façon atomique, ce qui empêche deux personnes de prendre la dernière place en même temps. Une activité déjà commencée ou déjà réservée par l'utilisateur est aussi refusée.
- **Réservation d'un autre utilisateur** : l'annulation vérifie que `reservation.user_id` correspond à l'utilisateur de la session (réponse 403), et le filtre figure aussi dans la requête `UPDATE`.
- **Pages administrateur** : trois niveaux de protection :
  1. le **proxy** (`src/proxy.ts`, via `checkAuth`) redirige les visiteurs non connectés et les non-administrateurs ;
  2. le **layout** `/admin` appelle `requireAdmin()`, qui relit le rôle en base ;
  3. chaque **route API** d'administration vérifie le rôle (403 sinon).
- Requêtes SQL **paramétrées** (`?`) partout : pas d'injection SQL possible.
- Mots de passe hachés avec bcrypt **côté serveur** (le serveur peut ainsi vérifier leurs règles de robustesse), cookie de session `httpOnly` + `sameSite=lax`, message d'erreur de connexion volontairement vague, redirection après connexion limitée aux URL internes.
- `src/utils/sessions.ts` n'a volontairement **pas** de directive `"use server"` : elle rendrait `encrypt()` appelable depuis le navigateur, et n'importe qui pourrait se fabriquer un jeton administrateur.
- Une capacité ne peut pas descendre sous le nombre de réservations actives, un type utilisé ne peut pas être supprimé, et le dernier administrateur ne peut pas supprimer son compte.

## 🎨 UX / UI

- Page **404 stylisée** pour toute URL inconnue ou tout identifiant invalide (`/activites/abc`, `/activites/9999`), avec un vrai statut HTTP 404
- **Métadonnées** propres à chaque page (`title` via le modèle `%s | Parc des Cimes`, `description`) ; elles sont dynamiques pour le détail d'une activité et pour la recherche
- Notifications (toasts) après chaque action
- Boîtes de confirmation avant chaque action destructive
- Formulaires accessibles : erreurs par champ, `aria-invalid`, saisie conservée après une erreur, boutons désactivés pendant l'envoi
- Interface responsive avec menu mobile, et lien d'évitement « Aller au contenu »

## 📁 Organisation du code

```
db/schema.sql            Script SQL de création des tables
scripts/init-db.ts       Création + données de démonstration
src/
├── proxy.ts             Redirections (connexion requise / rôle administrateur)
├── app/                 Routes : pages, layouts, 404, erreurs
│   ├── api/             Routes API (Route Handlers)
│   ├── activites/       Liste + recherche, détail [id]
│   ├── admin/           Tableau de bord, activités, types
│   └── connexion/ inscription/ profil/ reservations/
├── data/                Requêtes SQL (users, activités, réservations)
├── utils/               sessions.ts (JWT + cookie), bcryptjs.ts (mots de passe)
├── lib/                 Connexion BDD, auth, validation Zod, helpers API, formatage
├── hooks/               useApiForm (envoi des formulaires vers l'API)
├── types/               Types TypeScript des tables
├── fonts/               Polices (next/font)
└── components/          UI réutilisable (ui/), layout, activités, admin, profil
```
