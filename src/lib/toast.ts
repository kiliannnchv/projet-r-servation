/**
 * Petit bus d'événements côté client pour afficher des notifications
 * depuis n'importe quel composant, sans contexte React.
 */
import type { FlashMessage } from "@/lib/flash-shared";

export const TOAST_EVENT = "parc:toast";

/** Affiche une notification via le <Toaster /> monté dans le layout. */
export function toast(type: FlashMessage["type"], message: string): void {
  window.dispatchEvent(new CustomEvent<FlashMessage>(TOAST_EVENT, { detail: { type, message } }));
}
