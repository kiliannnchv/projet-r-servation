/**
 * Initialise la base de données : crée les tables (db/schema.sql)
 * puis insère un jeu de données de démonstration.
 *
 * Usage : `npm run db:init`  (⚠️ efface les données existantes)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

// Charge .env.local (DATABASE_NAME) s'il existe — fonction native de Node.js.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : on utilise la valeur par défaut.
}

const DATABASE_NAME = process.env.DATABASE_NAME || "database.db";

/** Renvoie une date située `days` jours après aujourd'hui, à l'heure donnée. */
function inDays(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  const db = await open({ filename: DATABASE_NAME, driver: sqlite3.Database });

  console.log("→ Création des tables…");
  await db.exec(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));

  console.log("→ Insertion des utilisateurs…");
  const [adminHash, userHash] = await Promise.all([bcrypt.hash("Admin123!", 10), bcrypt.hash("User1234!", 10)]);
  const users = [
    { prenom: "Alice", nom: "Martin", email: "admin@parc.fr", hash: adminHash, role: "admin" },
    { prenom: "Jean", nom: "Dupont", email: "jean@parc.fr", hash: userHash, role: "user" },
    { prenom: "Léa", nom: "Bernard", email: "lea@parc.fr", hash: userHash, role: "user" },
  ];
  const userIds: Record<string, number> = {};
  for (const user of users) {
    const result = await db.run(
      "INSERT INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, ?)",
      user.prenom,
      user.nom,
      user.email,
      user.hash,
      user.role,
    );
    userIds[user.prenom] = result.lastID!;
  }

  console.log("→ Insertion des types d'activités…");
  const typeIds: Record<string, number> = {};
  for (const nom of ["Accrobranche", "Kayak", "Escalade", "Tir à l'arc", "Tyrolienne", "Randonnée"]) {
    const result = await db.run("INSERT INTO type_activite (nom) VALUES (?)", nom);
    typeIds[nom] = result.lastID!;
  }
  const typeId = (nom: string) => typeIds[nom];

  console.log("→ Insertion des activités…");
  const activites = [
      {
        nom: "Parcours Ouistiti",
        typeId: typeId("Accrobranche"),
        placesDisponibles: 12,
        description:
          "Un parcours d'initiation à hauteur d'enfant (dès 4 ans) : ponts de singe, filets et petites tyroliennes, le tout sous ligne de vie continue.",
        datetimeDebut: inDays(1, 10),
        duree: 90,
      },
      {
        nom: "Parcours Noir — Cimes extrêmes",
        typeId: typeId("Accrobranche"),
        placesDisponibles: 8,
        description:
          "Le parcours le plus engagé du parc : 25 ateliers à plus de 18 mètres, saut de Tarzan et pont himalayen. Réservé aux plus de 14 ans en bonne condition physique.",
        datetimeDebut: inDays(2, 14),
        duree: 150,
      },
      {
        nom: "Descente de la rivière en kayak",
        typeId: typeId("Kayak"),
        placesDisponibles: 10,
        description:
          "8 km de descente encadrée par un moniteur diplômé, au fil de l'eau et des gorges. Savoir nager 25 m est obligatoire. Gilet et pagaie fournis.",
        datetimeDebut: inDays(3, 9, 30),
        duree: 180,
      },
      {
        nom: "Kayak au coucher du soleil",
        typeId: typeId("Kayak"),
        placesDisponibles: 2,
        description:
          "Une balade calme sur le lac en fin de journée, en kayak biplace. Session intimiste limitée à deux personnes.",
        datetimeDebut: inDays(4, 19),
        duree: 90,
      },
      {
        nom: "Initiation escalade en falaise",
        typeId: typeId("Escalade"),
        placesDisponibles: 6,
        description:
          "Découvrez la grimpe sur rocher naturel : apprentissage des nœuds, de l'assurage et des techniques de base sur des voies faciles.",
        datetimeDebut: inDays(5, 13, 30),
        duree: 180,
      },
      {
        nom: "Bloc & grande voie",
        typeId: typeId("Escalade"),
        placesDisponibles: 4,
        description:
          "Pour grimpeurs autonomes en moulinette : une matinée de bloc pour s'échauffer puis une grande voie de 3 longueurs avec un guide.",
        datetimeDebut: inDays(9, 8, 30),
        duree: 240,
      },
      {
        nom: "Tir à l'arc instinctif",
        typeId: typeId("Tir à l'arc"),
        placesDisponibles: 15,
        description:
          "Un parcours de 3D en forêt : tirez sur des cibles animalières dissimulées entre les arbres. Tout le matériel est fourni.",
        datetimeDebut: inDays(6, 15),
        duree: 120,
      },
      {
        nom: "La Grande Tyrolienne",
        typeId: typeId("Tyrolienne"),
        placesDisponibles: 20,
        description:
          "600 mètres de glisse au-dessus de la vallée, jusqu'à 80 km/h. Sensations garanties ! Poids entre 30 et 120 kg.",
        datetimeDebut: inDays(7, 11),
        duree: 45,
      },
      {
        nom: "Randonnée nocturne aux lampions",
        typeId: typeId("Randonnée"),
        placesDisponibles: 25,
        description:
          "Une balade contée de 6 km à la tombée de la nuit, à l'écoute de la faune nocturne. Prévoir de bonnes chaussures.",
        datetimeDebut: inDays(8, 20, 30),
        duree: 120,
      },
      {
        nom: "Randonnée des crêtes",
        typeId: typeId("Randonnée"),
        placesDisponibles: 18,
        description:
          "14 km et 700 m de dénivelé pour rejoindre le belvédère et son panorama à 360°. Pique-nique tiré du sac.",
        datetimeDebut: inDays(12, 8),
        duree: 360,
      },
      {
        nom: "Accrobranche en famille",
        typeId: typeId("Accrobranche"),
        placesDisponibles: 16,
        description:
          "Trois parcours progressifs à partager entre parents et enfants (dès 7 ans), avec un final en tyrolienne au-dessus de l'étang.",
        datetimeDebut: inDays(14, 14),
        duree: 120,
      },
      {
        nom: "Kayak — sortie passée",
        typeId: typeId("Kayak"),
        placesDisponibles: 10,
        description: "Une session déjà terminée, conservée pour l'historique des réservations.",
        datetimeDebut: inDays(-5, 10),
        duree: 120,
      },
  ];
  const activiteIds: Record<string, number> = {};
  for (const a of activites) {
    const result = await db.run(
      `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
       VALUES (?, ?, ?, ?, ?, ?)`,
      a.nom,
      a.typeId,
      a.placesDisponibles,
      a.description,
      a.datetimeDebut.toISOString(),
      a.duree,
    );
    activiteIds[a.nom] = result.lastID!;
  }
  const activiteId = (nom: string) => activiteIds[nom];
  const jean = { id: userIds["Jean"] };
  const lea = { id: userIds["Léa"] };

  console.log("→ Insertion des réservations…");
  const reservations: { userId: number; activiteId: number; dateReservation: Date; etat?: boolean }[] = [
    { userId: jean.id, activiteId: activiteId("Parcours Ouistiti"), dateReservation: inDays(-2, 9) },
    { userId: jean.id, activiteId: activiteId("Descente de la rivière en kayak"), dateReservation: inDays(-1, 18) },
    { userId: jean.id, activiteId: activiteId("La Grande Tyrolienne"), dateReservation: inDays(-3, 12), etat: false },
    { userId: jean.id, activiteId: activiteId("Kayak — sortie passée"), dateReservation: inDays(-10, 8) },
    // Les deux places du kayak au coucher du soleil sont prises : l'activité est complète.
    { userId: jean.id, activiteId: activiteId("Kayak au coucher du soleil"), dateReservation: inDays(-1, 10) },
    { userId: lea.id, activiteId: activiteId("Kayak au coucher du soleil"), dateReservation: inDays(-1, 11) },
    { userId: lea.id, activiteId: activiteId("Initiation escalade en falaise"), dateReservation: inDays(-1, 15) },
  ];
  for (const r of reservations) {
    await db.run(
      "INSERT INTO reservations (user_id, activite_id, date_reservation, etat) VALUES (?, ?, ?, ?)",
      r.userId,
      r.activiteId,
      r.dateReservation.toISOString(),
      r.etat === false ? 0 : 1,
    );
  }

  console.log(`✔ Base de données « ${DATABASE_NAME} » initialisée !`);
  console.log("  Administrateur : admin@parc.fr / Admin123!");
  console.log("  Utilisateurs   : jean@parc.fr, lea@parc.fr / User1234!");
  await db.close();
}

main()
  .catch((error: unknown) => {
    console.error("✖ Échec de l'initialisation :", error);
    process.exitCode = 1;
  });
