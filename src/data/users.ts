/**
 * Requêtes SQL sur la table `users`.
 */
import "server-only";
import { getDb } from "@/lib/db";
import type { PublicUser, Role, UserRow } from "@/types/models";

/** Colonnes renvoyées pour un utilisateur « public » (sans le hash du mot de passe). */
const PUBLIC_COLUMNS = "id, prenom, nom, email, role";

/** Récupère un utilisateur par son identifiant (sans mot de passe). */
export async function findUserById(id: number): Promise<PublicUser | null> {
  const db = await getDb();
  const user = await db.get<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`, id);
  return user ?? null;
}

/** Récupère un utilisateur par e-mail, hash du mot de passe compris (pour la connexion). */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE email = ?", email);
  return user ?? null;
}

/** Renvoie le hash du mot de passe d'un utilisateur. */
export async function getPasswordHash(userId: number): Promise<string | null> {
  const db = await getDb();
  const row = await db.get<Pick<UserRow, "motdepasse">>("SELECT motdepasse FROM users WHERE id = ?", userId);
  return row?.motdepasse ?? null;
}

/** Indique si une adresse e-mail est déjà utilisée (en excluant éventuellement un utilisateur). */
export async function emailExists(email: string, exceptUserId?: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.get("SELECT 1 FROM users WHERE email = ? AND id IS NOT ?", email, exceptUserId ?? null);
  return Boolean(row);
}

/** Crée un utilisateur (rôle `user`) et renvoie son identifiant. */
export async function createUser(data: {
  prenom: string;
  nom: string;
  email: string;
  passwordHash: string;
}): Promise<number> {
  const db = await getDb();
  const result = await db.run(
    "INSERT INTO users (prenom, nom, email, motdepasse) VALUES (?, ?, ?, ?)",
    data.prenom,
    data.nom,
    data.email,
    data.passwordHash,
  );
  return result.lastID!;
}

/** Met à jour le prénom, le nom et l'e-mail d'un utilisateur. */
export async function updateUser(id: number, data: { prenom: string; nom: string; email: string }): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE users SET prenom = ?, nom = ?, email = ? WHERE id = ?", data.prenom, data.nom, data.email, id);
}

/** Remplace le hash du mot de passe d'un utilisateur. */
export async function updatePassword(id: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE users SET motdepasse = ? WHERE id = ?", passwordHash, id);
}

/** Supprime un utilisateur ; ses réservations sont supprimées par la clé étrangère (CASCADE). */
export async function deleteUser(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM users WHERE id = ?", id);
}

/** Compte les utilisateurs ayant un rôle donné. */
export async function countUsersByRole(role: Role): Promise<number> {
  const db = await getDb();
  const row = await db.get<{ total: number }>("SELECT COUNT(*) AS total FROM users WHERE role = ?", role);
  return row?.total ?? 0;
}
