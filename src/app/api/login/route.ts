/**
 * POST /api/login — connexion avec e-mail et mot de passe.
 * Corps : { email, password }
 */
import { findUserByEmail } from "@/data/users";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-server";
import { loginSchema } from "@/lib/validation";
import { checkPassword } from "@/utils/bcryptjs";
import { createCookie } from "@/utils/sessions";
import type { Role } from "@/types/models";

export async function POST(req: Request) {
  const body = await parseBody(req, loginSchema);
  if (!body.ok) return body.response;
  const { email, password } = body.value;

  // Vérifie l'existence de l'utilisateur puis son mot de passe.
  const user = await findUserByEmail(email);
  const passwordOk = user ? await checkPassword(password, user.motdepasse) : false;

  // Message volontairement identique dans les deux cas : on ne révèle pas si l'e-mail existe.
  if (!user || !passwordOk) {
    return jsonError("E-mail ou mot de passe incorrect.", 401);
  }

  // Données stockées dans le JWT : identifiant, e-mail et rôle.
  await createCookie({ rowid: user.id, email: user.email, role: user.role });

  return jsonSuccess<{ role: Role }>({
    message: `Bon retour parmi nous, ${user.prenom} !`,
    data: { role: user.role },
  });
}
