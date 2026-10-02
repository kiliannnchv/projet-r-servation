/**
 * Requêtes SQL sur les réservations.
 */
import "server-only";
import { getDb } from "@/lib/db";
import { toActivite } from "@/data/activites";
import type { Activite, ActiviteRow, Reservation, ReservationRow, TypeActivite } from "@/types/models";

/** Réservation accompagnée de l'activité réservée et de son type. */
export type ReservationDetail = Reservation & {
  activite: Activite & { type: TypeActivite };
};

/** Convertit une ligne SQLite en modèle applicatif. */
function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    userId: row.user_id,
    activiteId: row.activite_id,
    dateReservation: new Date(row.date_reservation),
    etat: row.etat === 1,
  };
}

/* --------------------------------- Lecture --------------------------------- */

/** Liste toutes les réservations d'un utilisateur (les plus récentes d'abord). */
export async function listUserReservations(userId: number): Promise<ReservationDetail[]> {
  const db = await getDb();
  // Les colonnes de l'activité sont préfixées pour ne pas écraser celles de la réservation.
  const rows = await db.all<
    (ReservationRow & {
      a_nom: string;
      a_type_id: number;
      a_places: number;
      a_description: string;
      a_debut: string;
      a_duree: number;
      type_nom: string;
    })[]
  >(
    `SELECT r.*,
            a.nom AS a_nom, a.type_id AS a_type_id, a.places_disponibles AS a_places,
            a.description AS a_description, a.datetime_debut AS a_debut, a.duree AS a_duree,
            t.nom AS type_nom
     FROM reservations r
     JOIN activites a ON a.id = r.activite_id
     JOIN type_activite t ON t.id = a.type_id
     WHERE r.user_id = ?
     ORDER BY r.date_reservation DESC`,
    userId,
  );

  return rows.map((row) => {
    const activiteRow: ActiviteRow = {
      id: row.activite_id,
      nom: row.a_nom,
      type_id: row.a_type_id,
      places_disponibles: row.a_places,
      description: row.a_description,
      datetime_debut: row.a_debut,
      duree: row.a_duree,
    };
    return {
      ...toReservation(row),
      activite: { ...toActivite(activiteRow), type: { id: row.a_type_id, nom: row.type_nom } },
    };
  });
}

/** Renvoie la réservation active d'un utilisateur pour une activité, s'il en a une. */
export async function findActiveReservation(userId: number, activiteId: number): Promise<Reservation | null> {
  const db = await getDb();
  const row = await db.get<ReservationRow>(
    "SELECT * FROM reservations WHERE user_id = ? AND activite_id = ? AND etat = 1",
    userId,
    activiteId,
  );
  return row ? toReservation(row) : null;
}

/** Récupère une réservation avec la date de début de son activité. */
export async function findReservation(id: number): Promise<(Reservation & { activiteDebut: Date }) | null> {
  const db = await getDb();
  const row = await db.get<ReservationRow & { datetime_debut: string }>(
    `SELECT r.*, a.datetime_debut
     FROM reservations r JOIN activites a ON a.id = r.activite_id
     WHERE r.id = ?`,
    id,
  );
  return row ? { ...toReservation(row), activiteDebut: new Date(row.datetime_debut) } : null;
}

/** Identifiants des activités réservées (réservations actives) par un utilisateur. */
export async function listReservedActiviteIds(userId: number): Promise<Set<number>> {
  const db = await getDb();
  const rows = await db.all<{ activite_id: number }[]>(
    "SELECT activite_id FROM reservations WHERE user_id = ? AND etat = 1",
    userId,
  );
  return new Set(rows.map((row) => row.activite_id));
}

/** Participant inscrit à une activité (vue administrateur). */
export type Participant = {
  reservationId: number;
  dateReservation: Date;
  prenom: string;
  nom: string;
  email: string;
};

/** Liste les participants (réservations actives) d'une activité. */
export async function listParticipants(activiteId: number): Promise<Participant[]> {
  const db = await getDb();
  const rows = await db.all<{ id: number; date_reservation: string; prenom: string; nom: string; email: string }[]>(
    `SELECT r.id, r.date_reservation, u.prenom, u.nom, u.email
     FROM reservations r JOIN users u ON u.id = r.user_id
     WHERE r.activite_id = ? AND r.etat = 1
     ORDER BY r.date_reservation`,
    activiteId,
  );
  return rows.map((row) => ({
    reservationId: row.id,
    dateReservation: new Date(row.date_reservation),
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
  }));
}

/** Chiffres clés affichés sur le tableau de bord administrateur. */
export type AdminStats = {
  activitesAVenir: number;
  reservationsActives: number;
  utilisateurs: number;
  types: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const db = await getDb();
  const stats = await db.get<AdminStats>(
    `SELECT
       (SELECT COUNT(*) FROM activites WHERE datetime_debut >= ?) AS activitesAVenir,
       (SELECT COUNT(*) FROM reservations WHERE etat = 1)         AS reservationsActives,
       (SELECT COUNT(*) FROM users)                               AS utilisateurs,
       (SELECT COUNT(*) FROM type_activite)                       AS types`,
    new Date().toISOString(),
  );
  return stats!;
}

/* -------------------------------- Écriture --------------------------------- */

/**
 * Crée une réservation **uniquement si** toutes les règles sont respectées :
 * activité existante et pas encore commencée, pas de réservation active du même
 * utilisateur, et au moins une place restante.
 *
 * Tout est vérifié dans une seule requête `INSERT … SELECT … WHERE` : SQLite
 * l'exécute de façon atomique, ce qui empêche deux personnes de prendre la
 * dernière place en même temps.
 *
 * @returns `true` si la réservation a été créée.
 */
export async function createReservationIfAvailable(userId: number, activiteId: number): Promise<boolean> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.run(
    `INSERT INTO reservations (user_id, activite_id, date_reservation, etat)
     SELECT ?, a.id, ?, 1
     FROM activites a
     WHERE a.id = ?
       AND a.datetime_debut > ?
       AND NOT EXISTS (
         SELECT 1 FROM reservations WHERE activite_id = a.id AND user_id = ? AND etat = 1
       )
       AND a.places_disponibles > (
         SELECT COUNT(*) FROM reservations WHERE activite_id = a.id AND etat = 1
       )`,
    userId,
    now,
    activiteId,
    now,
    userId,
  );
  return result.changes === 1;
}

/** Annule une réservation (passage de `etat` à 0) appartenant à l'utilisateur donné. */
export async function cancelReservation(id: number, userId: number): Promise<void> {
  const db = await getDb();
  // La condition sur user_id est répétée ici : même mal appelée, la requête
  // ne peut pas annuler la réservation de quelqu'un d'autre.
  await db.run("UPDATE reservations SET etat = 0 WHERE id = ? AND user_id = ?", id, userId);
}
