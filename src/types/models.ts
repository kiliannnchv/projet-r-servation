/**
 * Types des données manipulées par l'application.
 *
 * Deux familles de types :
 *  - `…Row` : une ligne telle que renvoyée par SQLite (colonnes de la base,
 *    dates en texte, booléens en 0/1) ;
 *  - les modèles (`User`, `Activite`…) : la même donnée convertie pour
 *    l'application (camelCase, vraies `Date`, vrais booléens).
 * La conversion est faite dans les fichiers de `src/data/`.
 */

/** Rôles possibles pour un utilisateur. */
export const ROLES = ["user", "admin"] as const;
export type Role = (typeof ROLES)[number];

/* ---------------------------- Lignes SQLite brutes ---------------------------- */

export type UserRow = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  motdepasse: string;
  role: Role;
};

export type TypeActiviteRow = {
  id: number;
  nom: string;
};

export type ActiviteRow = {
  id: number;
  nom: string;
  type_id: number;
  places_disponibles: number;
  description: string;
  /** Date ISO 8601 (UTC). */
  datetime_debut: string;
  duree: number;
};

export type ReservationRow = {
  id: number;
  user_id: number;
  activite_id: number;
  date_reservation: string;
  /** 1 = active, 0 = annulée. */
  etat: 0 | 1;
};

/* ------------------------------ Modèles applicatifs ------------------------------ */

/** Utilisateur sans son hash de mot de passe : ce qui peut circuler dans l'app. */
export type PublicUser = Omit<UserRow, "motdepasse">;

export type TypeActivite = TypeActiviteRow;

export type Activite = {
  id: number;
  nom: string;
  typeId: number;
  /** Capacité totale de la session. */
  placesDisponibles: number;
  description: string;
  datetimeDebut: Date;
  /** Durée en minutes. */
  duree: number;
};

export type Reservation = {
  id: number;
  userId: number;
  activiteId: number;
  dateReservation: Date;
  /** `true` = active, `false` = annulée. */
  etat: boolean;
};
