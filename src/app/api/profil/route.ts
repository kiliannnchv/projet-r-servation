/**
 * /api/profil — profil de l'utilisateur connecté.
 *   PATCH  : modifie prénom, nom et e-mail   — corps : { prenom, nom, email }
 *   DELETE : supprime le compte              — corps : { password }
 */
import { countUsersByRole, deleteUser, emailExists, getPasswordHash, updateUser } from "@/data/users";
import { jsonError, jsonSuccess, parseBody, requireApiUser } from "@/lib/api-server";
import { deleteAccountSchema, profileSchema } from "@/lib/validation";
import { checkPassword } from "@/utils/bcryptjs";
import { createCookie, logout } from "@/utils/sessions";

export async function PATCH(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const user = auth.value;

  const body = await parseBody(req, profileSchema);
  if (!body.ok) return body.response;

  // L'e-mail doit rester unique (en excluant l'utilisateur lui-même).
  if (await emailExists(body.value.email, user.id)) {
    return jsonError("Cette adresse e-mail est déjà utilisée.", 409, {
      email: ["Cette adresse e-mail est déjà utilisée."],
    });
  }

  await updateUser(user.id, body.value);
  // L'e-mail fait partie du JWT : on renouvelle la session.
  await createCookie({ rowid: user.id, email: body.value.email, role: user.role });

  return jsonSuccess({ message: "Votre profil a été mis à jour." });
}

export async function DELETE(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const user = auth.value;

  const body = await parseBody(req, deleteAccountSchema);
  if (!body.ok) return body.response;

  // Confirmation par mot de passe.
  const hash = await getPasswordHash(user.id);
  if (!hash || !(await checkPassword(body.value.password, hash))) {
    return jsonError("Mot de passe incorrect.", 403, { password: ["Mot de passe incorrect."] });
  }

  // Le parc doit toujours garder au moins un administrateur.
  if (user.role === "admin" && (await countUsersByRole("admin")) <= 1) {
    return jsonError("Vous êtes le seul administrateur : votre compte ne peut pas être supprimé.", 409);
  }

  // Les réservations de l'utilisateur sont supprimées en cascade.
  await deleteUser(user.id);
  await logout();

  return jsonSuccess({ message: "Votre compte a été supprimé. Nous espérons vous revoir bientôt !" });
}
