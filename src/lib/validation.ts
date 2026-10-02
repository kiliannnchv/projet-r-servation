/**
 * Schémas de validation (Zod) utilisés par les routes API (`src/app/api`).
 * Les messages d'erreur sont rédigés pour être affichés tels quels à l'utilisateur.
 */
import { z } from "zod";

/** Champ texte obligatoire, nettoyé des espaces superflus. */
const requiredText = (label: string, max = 100) =>
  z
    .string({ error: `${label} est obligatoire.` })
    .trim()
    .min(1, { error: `${label} est obligatoire.` })
    .max(max, { error: `${label} ne doit pas dépasser ${max} caractères.` });

const email = z
  .string({ error: "L'adresse e-mail est obligatoire." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "L'adresse e-mail n'est pas valide." }));

/** Règles de robustesse d'un mot de passe. */
const password = z
  .string({ error: "Le mot de passe est obligatoire." })
  .min(8, { error: "Au moins 8 caractères." })
  .max(72, { error: "72 caractères maximum." }) // limite de bcrypt
  .regex(/[a-z]/, { error: "Au moins une lettre minuscule." })
  .regex(/[A-Z]/, { error: "Au moins une lettre majuscule." })
  .regex(/[0-9]/, { error: "Au moins un chiffre." });

/* ------------------------------- Utilisateurs ------------------------------ */

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Le mot de passe est obligatoire." }),
});

export const registerSchema = z
  .object({
    prenom: requiredText("Le prénom", 50),
    nom: requiredText("Le nom", 50),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  prenom: requiredText("Le prénom", 50),
  nom: requiredText("Le nom", 50),
  email,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Le mot de passe actuel est obligatoire." }),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, { error: "Confirmez avec votre mot de passe." }),
});

/* -------------------------------- Activités -------------------------------- */

export const activiteSchema = z.object({
  nom: requiredText("Le nom", 100),
  typeId: z.coerce
    .number({ error: "Choisissez un type d'activité." })
    .int()
    .positive({ error: "Choisissez un type d'activité." }),
  placesDisponibles: z.coerce
    .number({ error: "Indiquez un nombre de places." })
    .int({ error: "Le nombre de places doit être un entier." })
    .min(1, { error: "Au moins 1 place." })
    .max(500, { error: "500 places maximum." }),
  description: z
    .string()
    .trim()
    .min(10, { error: "La description doit faire au moins 10 caractères." })
    .max(2000, { error: "La description ne doit pas dépasser 2000 caractères." }),
  /** Valeur d'un `<input type="datetime-local">`, ex. « 2026-10-05T14:30 ». */
  datetimeDebut: z
    .string()
    .min(1, { error: "La date de début est obligatoire." })
    .transform((value) => new Date(value))
    .refine((date) => !Number.isNaN(date.getTime()), { error: "La date n'est pas valide." }),
  duree: z.coerce
    .number({ error: "Indiquez une durée." })
    .int({ error: "La durée doit être un nombre entier de minutes." })
    .min(15, { error: "15 minutes minimum." })
    .max(24 * 60, { error: "24 heures maximum." }),
});

export const typeActiviteSchema = z.object({
  nom: requiredText("Le nom du type", 50),
});

/** Identifiant numérique reçu dans un formulaire ou une URL. */
export const idSchema = z.coerce.number().int().positive();

/**
 * Transforme les erreurs Zod en dictionnaire { champ: [messages] }
 * exploitable directement par les formulaires.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
