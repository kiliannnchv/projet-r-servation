/**
 * Requêtes SQL sur les activités et leurs types.
 */
import "server-only";
import { getDb } from "@/lib/db";
import type { Activite, ActiviteRow, TypeActivite } from "@/types/models";

/** Activité enrichie de son type et de son taux de remplissage. */
export type ActiviteDetail = Activite & {
  type: TypeActivite;
  /** Nombre de réservations actives. */
  placesReservees: number;
  /** Places encore disponibles (capacité − réservations actives). */
  placesRestantes: number;
};

/** Données saisies dans le formulaire d'activité (après validation). */
export type ActiviteInput = Omit<Activite, "id">;

/** Filtres de la liste des activités. */
export type ActiviteFilters = {
  /** Recherche (partielle, insensible à la casse) sur le nom. */
  search?: string;
  typeId?: number;
  /** Inclure les activités déjà commencées / passées. */
  includePast?: boolean;
};

/** Ligne renvoyée par la requête « activité + type + places réservées ». */
type ActiviteDetailRow = ActiviteRow & { type_nom: string; places_reservees: number };

/**
 * Requête de base : activité + nom du type + nombre de réservations actives.
 * La jointure externe ne compte que les réservations dont `etat = 1`.
 */
const SELECT_DETAIL = `
  SELECT a.*, t.nom AS type_nom, COUNT(r.id) AS places_reservees
  FROM activites a
  JOIN type_activite t ON t.id = a.type_id
  LEFT JOIN reservations r ON r.activite_id = a.id AND r.etat = 1`;

/** Convertit une ligne SQLite en modèle applicatif. */
export function toActivite(row: ActiviteRow): Activite {
  return {
    id: row.id,
    nom: row.nom,
    typeId: row.type_id,
    placesDisponibles: row.places_disponibles,
    description: row.description,
    datetimeDebut: new Date(row.datetime_debut),
    duree: row.duree,
  };
}

/** Convertit une ligne détaillée en `ActiviteDetail`. */
function toActiviteDetail(row: ActiviteDetailRow): ActiviteDetail {
  return {
    ...toActivite(row),
    type: { id: row.type_id, nom: row.type_nom },
    placesReservees: row.places_reservees,
    placesRestantes: Math.max(0, row.places_disponibles - row.places_reservees),
  };
}

/** Échappe les caractères spéciaux de LIKE pour une recherche littérale. */
function likePattern(search: string): string {
  return `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/* --------------------------------- Lecture --------------------------------- */

/** Liste les activités selon les filtres, triées par date de début. */
export async function listActivites(filters: ActiviteFilters = {}): Promise<ActiviteDetail[]> {
  // Construction dynamique du WHERE, toujours avec des paramètres « ? » (pas d'injection SQL).
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.search) {
    conditions.push("a.nom LIKE ? ESCAPE '\\'");
    params.push(likePattern(filters.search));
  }
  if (filters.typeId) {
    conditions.push("a.type_id = ?");
    params.push(filters.typeId);
  }
  if (!filters.includePast) {
    conditions.push("a.datetime_debut >= ?");
    params.push(new Date().toISOString());
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = filters.includePast ? "DESC" : "ASC";

  const db = await getDb();
  const rows = await db.all<ActiviteDetailRow[]>(
    `${SELECT_DETAIL} ${where} GROUP BY a.id ORDER BY a.datetime_debut ${order}`,
    ...params,
  );
  return rows.map(toActiviteDetail);
}

/** Récupère une activité par son identifiant, ou `null` si elle n'existe pas. */
export async function getActivite(id: number): Promise<ActiviteDetail | null> {
  const db = await getDb();
  const row = await db.get<ActiviteDetailRow>(`${SELECT_DETAIL} WHERE a.id = ? GROUP BY a.id`, id);
  return row ? toActiviteDetail(row) : null;
}

/* -------------------------------- Écriture --------------------------------- */

/** Crée une activité et renvoie son identifiant. */
export async function createActivite(data: ActiviteInput): Promise<number> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.nom,
    data.typeId,
    data.placesDisponibles,
    data.description,
    data.datetimeDebut.toISOString(),
    data.duree,
  );
  return result.lastID!;
}

/** Met à jour une activité. */
export async function updateActivite(id: number, data: ActiviteInput): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE activites
     SET nom = ?, type_id = ?, places_disponibles = ?, description = ?, datetime_debut = ?, duree = ?
     WHERE id = ?`,
    data.nom,
    data.typeId,
    data.placesDisponibles,
    data.description,
    data.datetimeDebut.toISOString(),
    data.duree,
    id,
  );
}

/** Supprime une activité ; ses réservations sont supprimées par la clé étrangère (CASCADE). */
export async function deleteActivite(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM activites WHERE id = ?", id);
}

/* ---------------------------- Types d'activités ---------------------------- */

/** Type d'activité accompagné du nombre d'activités qui l'utilisent. */
export type TypeActiviteAvecCompte = TypeActivite & { nbActivites: number };

/** Liste tous les types d'activités, par ordre alphabétique. */
export async function listTypes(): Promise<TypeActiviteAvecCompte[]> {
  const db = await getDb();
  return db.all<TypeActiviteAvecCompte[]>(
    `SELECT t.id, t.nom, COUNT(a.id) AS nbActivites
     FROM type_activite t
     LEFT JOIN activites a ON a.type_id = t.id
     GROUP BY t.id
     ORDER BY t.nom COLLATE NOCASE`,
  );
}

/** Récupère un type par son identifiant. */
export async function findType(id: number): Promise<TypeActivite | null> {
  const db = await getDb();
  return (await db.get<TypeActivite>("SELECT id, nom FROM type_activite WHERE id = ?", id)) ?? null;
}

/** Indique si un autre type porte déjà ce nom (insensible à la casse). */
export async function typeNameExists(nom: string, exceptId?: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.get(
    "SELECT 1 FROM type_activite WHERE nom = ? COLLATE NOCASE AND id IS NOT ?",
    nom,
    exceptId ?? null,
  );
  return Boolean(row);
}

/** Nombre d'activités rattachées à un type. */
export async function countActivitesByType(typeId: number): Promise<number> {
  const db = await getDb();
  const row = await db.get<{ total: number }>("SELECT COUNT(*) AS total FROM activites WHERE type_id = ?", typeId);
  return row?.total ?? 0;
}

export async function createType(nom: string): Promise<void> {
  const db = await getDb();
  await db.run("INSERT INTO type_activite (nom) VALUES (?)", nom);
}

export async function renameType(id: number, nom: string): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE type_activite SET nom = ? WHERE id = ?", nom, id);
}

export async function deleteType(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM type_activite WHERE id = ?", id);
}
