/**
 * Connexion à la base SQLite (librairies `sqlite` + `sqlite3`).
 */
import "server-only";
import { open, type Database } from "sqlite";
import sqlite3 from "sqlite3";

/*
 * Une seule connexion est ouverte puis partagée par toutes les requêtes.
 * En développement, le hot-reload ré-exécute ce module : on mémorise donc
 * la promesse dans `globalThis` pour ne pas rouvrir la base à chaque fois.
 */
const globalForDb = globalThis as unknown as { dbPromise?: Promise<Database> };

/** Ouvre la base et active les clés étrangères (désactivées par défaut dans SQLite). */
async function openDatabase(): Promise<Database> {
  const db = await open({
    filename: process.env.DATABASE_NAME || "database.db",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON");
  return db;
}

/** Renvoie la connexion partagée à la base de données. */
export function getDb(): Promise<Database> {
  globalForDb.dbPromise ??= openDatabase();
  return globalForDb.dbPromise;
}
