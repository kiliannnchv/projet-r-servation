/**
 * POST /api/register — inscription d'un nouvel utilisateur.
 * Corps : { prenom, nom, email, password, confirmPassword }
 */
import { createUser, emailExists } from "@/data/users";
import { jsonError, jsonSuccess, parseBody } from "@/lib/api-server";
import { registerSchema } from "@/lib/validation";
import { hashPassword } from "@/utils/bcryptjs";
import { createCookie } from "@/utils/sessions";

export async function POST(req: Request) {
  const body = await parseBody(req, registerSchema);
  if (!body.ok) return body.response;
  const { prenom, nom, email, password } = body.value;

  // Vérifie que l'utilisateur n'existe pas encore (409 = conflit).
  if (await emailExists(email)) {
    return jsonError("Un compte existe déjà avec cette adresse e-mail.", 409, {
      email: ["Un compte existe déjà avec cette adresse e-mail."],
    });
  }

  // Le mot de passe est haché côté serveur, après validation de ses règles.
  const id = await createUser({ prenom, nom, email, passwordHash: await hashPassword(password) });

  // Connexion automatique après l'inscription.
  await createCookie({ rowid: id, email, role: "user" });

  return jsonSuccess({ message: `Bienvenue ${prenom} ! Votre compte a bien été créé.` }, 201);
}
