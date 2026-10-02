/**
 * Utilitaires communs aux routes API (`src/app/api/…/route.ts`).
 */
import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { toFieldErrors } from "@/lib/validation";
import type { ApiError, ApiSuccess } from "@/lib/api";
import type { PublicUser } from "@/types/models";

/** Réponse JSON de succès. */
export function jsonSuccess<T>(body: ApiSuccess<T>, status = 200) {
  return NextResponse.json(body, { status });
}

/** Réponse JSON d'erreur avec le statut HTTP approprié. */
export function jsonError(message: string, status: number, fieldErrors?: Record<string, string[]>) {
  const body: ApiError = fieldErrors ? { message, fieldErrors } : { message };
  return NextResponse.json(body, { status });
}

/** Résultat d'une étape de route : soit une valeur, soit une réponse d'erreur à renvoyer. */
type Result<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

/**
 * Lit le corps JSON de la requête et le valide avec un schéma Zod.
 * En cas d'échec, renvoie une réponse 400 avec les erreurs par champ.
 */
export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<Result<z.infer<S>>> {
  const body: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError("Certains champs sont invalides.", 400, toFieldErrors(parsed.error)),
    };
  }
  return { ok: true, value: parsed.data };
}

/** Exige un utilisateur connecté, sinon réponse 401. */
export async function requireApiUser(): Promise<Result<PublicUser>> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, response: jsonError("Vous devez être connecté.", 401) };
  }
  return { ok: true, value: user };
}

/** Exige un administrateur, sinon réponse 401 (non connecté) ou 403 (pas les droits). */
export async function requireApiAdmin(): Promise<Result<PublicUser>> {
  const auth = await requireApiUser();
  if (auth.ok && auth.value.role !== "admin") {
    return { ok: false, response: jsonError("Action réservée aux administrateurs.", 403) };
  }
  return auth;
}

/** Lit l'identifiant numérique d'une route dynamique (`[id]`). */
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
