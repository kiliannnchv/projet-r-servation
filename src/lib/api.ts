/**
 * Format des réponses de l'API, partagé entre les routes (serveur)
 * et les formulaires (client).
 */

/** Corps d'une réponse d'erreur. */
export type ApiError = {
  message: string;
  /** Erreurs de validation par champ (statut 400). */
  fieldErrors?: Record<string, string[]>;
};

/** Corps d'une réponse réussie. */
export type ApiSuccess<T = unknown> = {
  message?: string;
  data?: T;
};

/** Résultat d'un appel à l'API côté client. */
export type ApiResult<T = unknown> = ({ ok: true } & ApiSuccess<T>) | ({ ok: false } & ApiError);

/** Méthodes HTTP utilisées par l'application. */
export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Appelle une route de l'API avec `fetch` (corps JSON) et renvoie un résultat typé.
 * Les erreurs réseau sont converties en message lisible.
 */
export async function callApi<T = unknown>(url: string, method: HttpMethod, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await response.json().catch(() => ({}))) as ApiSuccess<T> & Partial<ApiError>;

    if (!response.ok) {
      return {
        ok: false,
        message: json.message ?? "Une erreur est survenue.",
        fieldErrors: json.fieldErrors,
      };
    }
    return { ok: true, message: json.message, data: json.data };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Impossible de contacter le serveur. Vérifiez votre connexion." };
  }
}
