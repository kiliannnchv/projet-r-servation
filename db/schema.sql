-- =============================================================================
--  Base de données du Parc — script de création (SQLite)
--
--  Exécuté par `npm run db:init` (scripts/init-db.ts), ou manuellement depuis
--  VS Code avec l'extension SQLTools (« Run on active connection »).
--  ⚠️ Supprime puis recrée toutes les tables.
-- =============================================================================

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS activites;
DROP TABLE IF EXISTS type_activite;
DROP TABLE IF EXISTS users;

-- Comptes utilisateurs. `motdepasse` contient un hash bcrypt, jamais le mot de passe en clair.
CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  prenom      VARCHAR(50)  NOT NULL,
  nom         VARCHAR(50)  NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  motdepasse  VARCHAR(255) NOT NULL,
  role        VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Catégories d'activités (accrobranche, kayak…).
CREATE TABLE type_activite (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  nom  VARCHAR(50) NOT NULL UNIQUE
);

-- Sessions d'activités.
--   places_disponibles : capacité totale (les places restantes sont calculées)
--   datetime_debut     : date ISO 8601 en UTC, ex. « 2026-10-05T12:00:00.000Z »
--   duree              : durée en minutes
CREATE TABLE activites (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  nom                 VARCHAR(100) NOT NULL,
  type_id             INTEGER      NOT NULL REFERENCES type_activite (id) ON DELETE RESTRICT,
  places_disponibles  INTEGER      NOT NULL CHECK (places_disponibles > 0),
  description         TEXT         NOT NULL,
  datetime_debut      DATETIME     NOT NULL,
  duree               INTEGER      NOT NULL CHECK (duree > 0)
);
CREATE INDEX activites_type_idx ON activites (type_id);

-- Réservations. `etat` : 1 (true) = active, 0 (false) = annulée.
-- Supprimer un utilisateur ou une activité supprime ses réservations (CASCADE).
CREATE TABLE reservations (
  id                INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  activite_id       INTEGER  NOT NULL REFERENCES activites (id) ON DELETE CASCADE,
  date_reservation  DATETIME NOT NULL,
  etat              BOOLEAN  NOT NULL DEFAULT 1 CHECK (etat IN (0, 1))
);
CREATE INDEX reservations_user_idx ON reservations (user_id);
CREATE INDEX reservations_activite_idx ON reservations (activite_id);
