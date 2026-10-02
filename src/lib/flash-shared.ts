/** Constantes et types des messages flash, partagés client / serveur / proxy. */

export const FLASH_COOKIE = "parc_flash";

export type FlashMessage = {
  type: "success" | "error" | "info";
  message: string;
};

/** Décode la valeur brute du cookie flash (encodée en URL par Next.js) ; renvoie `null` si elle est invalide. */
export function parseFlash(raw: string | undefined): FlashMessage | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "type" in parsed &&
      "message" in parsed &&
      typeof parsed.message === "string" &&
      (parsed.type === "success" || parsed.type === "error" || parsed.type === "info")
    ) {
      return { type: parsed.type, message: parsed.message };
    }
  } catch {
    // Cookie mal formé : on l'ignore.
  }
  return null;
}
