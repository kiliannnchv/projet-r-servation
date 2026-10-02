/**
 * Fonctions d'affichage (dates, durées, pluriels) en français.
 */

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** « mardi 6 octobre 2026 » */
export const formatDate = (date: Date): string => dateFormatter.format(date);

/** « 06 oct. » */
export const formatShortDate = (date: Date): string => shortDateFormatter.format(date);

/** « oct. » */
export const formatMonth = (date: Date): string => monthFormatter.format(date);

/** « 14:30 » */
export const formatTime = (date: Date): string => timeFormatter.format(date);

/** « 6 oct. 2026, 14:30 » */
export const formatDateTime = (date: Date): string => dateTimeFormatter.format(date);

/** Convertit une durée en minutes en texte lisible : 90 → « 1 h 30 ». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/** Accorde un mot selon un nombre : plural(3, "place") → « 3 places ». */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${Math.abs(count) > 1 ? pluralForm : singular}`;
}

/**
 * Formate une date pour un `<input type="datetime-local">` (heure locale du serveur),
 * ex. « 2026-10-05T14:30 ».
 */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Calcule l'heure de fin d'une activité. */
export const getEndDate = (start: Date, durationMinutes: number): Date =>
  new Date(start.getTime() + durationMinutes * 60_000);

/** Convertit une activité en valeurs de formulaire (toutes en texte). */
export function activiteToFormValues(activite: {
  nom: string;
  typeId: number;
  placesDisponibles: number;
  description: string;
  datetimeDebut: Date;
  duree: number;
}): Record<string, string> {
  return {
    nom: activite.nom,
    typeId: String(activite.typeId),
    placesDisponibles: String(activite.placesDisponibles),
    description: activite.description,
    datetimeDebut: toDateTimeLocalValue(activite.datetimeDebut),
    duree: String(activite.duree),
  };
}
