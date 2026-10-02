/**
 * Vérification des droits côté serveur (pages, layouts et routes API).
 *
 * Le proxy ne fait qu'une redirection « optimiste » à partir du cookie : la
 * vraie sécurité est assurée ici, en relisant l'utilisateur en base.
 */
import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { findUserById } from "@/data/users";
import { getSession } from "@/utils/sessions";
import type { PublicUser } from "@/types/models";

/**
 * Renvoie l'utilisateur connecté (sans son mot de passe) ou `null`.
 *
 * L'utilisateur est relu en base à chaque requête : un compte supprimé ou un
 * rôle modifié est ainsi pris en compte immédiatement.
 * `cache` évite de refaire la requête plusieurs fois pendant un même rendu.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await getSession();
  if (!session) return null;
  return findUserById(session.rowid);
});

/**
 * Exige un utilisateur connecté (pages uniquement : redirige vers la connexion).
 * @param redirectTo page vers laquelle revenir après la connexion
 */
export async function requireUser(redirectTo?: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/connexion${query}`);
  }
  return user;
}

/**
 * Exige un administrateur (pages uniquement). Un simple utilisateur obtient
 * une 404 : on ne révèle pas l'existence des pages d'administration.
 */
export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") notFound();
  return user;
}
