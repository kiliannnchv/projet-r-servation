/**
 * Gestion des sessions : un JWT signé (HS256, librairie `jose`) stocké dans
 * un cookie `httpOnly` nommé « session ».
 *
 * ⚠️ Volontairement SANS la directive "use server" : elle transformerait
 * chaque fonction exportée en point d'accès appelable depuis le navigateur,
 * et n'importe qui pourrait alors faire signer `{ role: "admin" }` par `encrypt`.
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Role } from "@/types/models";

/** Nom du cookie de session. */
export const SESSION_COOKIE = "session";

/** Durée de validité d'une session (JWT et cookie). */
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 jours

/** Données signées dans le JWT. */
export type SessionPayload = {
  /** Identifiant de l'utilisateur (`users.id`). */
  rowid: number;
  email: string;
  role: Role;
};

/**
 * Clé de signature, lue dans `JWT_SECRET` (.env.local).
 * En développement, une clé par défaut permet de lancer le projet sans configuration.
 */
function getKey(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("La variable d'environnement JWT_SECRET est manquante.");
    }
    return new TextEncoder().encode("dev-only-secret-ne-pas-utiliser-en-production");
  }
  return new TextEncoder().encode(secretKey);
}

/** Crée le JWT à partir des données de session. */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    // Durée relative (« 604800s ») : jose calcule l'expiration en secondes.
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getKey());
}

/**
 * Lit et vérifie un JWT.
 * @returns les données de session, ou `null` si le jeton est absent, altéré ou expiré
 *          (`jwtVerify` vérifie lui-même la date d'expiration).
 */
export async function decrypt(input: string | undefined): Promise<SessionPayload | null> {
  if (!input) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(input, getKey(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

/** Crée le cookie de session (à appeler depuis une route API). */
export async function createCookie(sessionData: SessionPayload): Promise<void> {
  const encryptedSessionData = await encrypt(sessionData);
  const cookie = await cookies();
  cookie.set(SESSION_COOKIE, encryptedSessionData, {
    httpOnly: true, // illisible en JavaScript côté navigateur
    secure: process.env.NODE_ENV === "production", // HTTPS uniquement en production
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** Supprime le cookie de session (déconnexion). */
export async function logout(): Promise<void> {
  const cookie = await cookies();
  cookie.delete(SESSION_COOKIE);
}

/** Lit la session courante depuis le cookie (pages, layouts, routes API). */
export async function getSession(): Promise<SessionPayload | null> {
  const cookie = await cookies();
  return decrypt(cookie.get(SESSION_COOKIE)?.value);
}

/**
 * Vérifie la session d'une requête entrante, pour le proxy.
 * Dans le proxy, on lit le cookie sur la requête (`request.cookies`), comme le
 * recommande la documentation de Next.js.
 * @returns la session si l'utilisateur est connecté, sinon `null`.
 */
export async function checkAuth(request: NextRequest): Promise<SessionPayload | null> {
  return decrypt(request.cookies.get(SESSION_COOKIE)?.value);
}
