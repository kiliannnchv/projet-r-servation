/**
 * PUT /api/profil/mot-de-passe — changement de mot de passe.
 * Corps : { currentPassword, newPassword, confirmPassword }
 */
import { getPasswordHash, updatePassword } from "@/data/users";
import { jsonError, jsonSuccess, parseBody, requireApiUser } from "@/lib/api-server";
import { passwordChangeSchema } from "@/lib/validation";
import { checkPassword, hashPassword } from "@/utils/bcryptjs";

export async function PUT(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const user = auth.value;

  const body = await parseBody(req, passwordChangeSchema);
  if (!body.ok) return body.response;

  // L'ancien mot de passe doit être correct.
  const hash = await getPasswordHash(user.id);
  if (!hash || !(await checkPassword(body.value.currentPassword, hash))) {
    return jsonError("Mot de passe actuel incorrect.", 403, {
      currentPassword: ["Mot de passe actuel incorrect."],
    });
  }

  await updatePassword(user.id, await hashPassword(body.value.newPassword));
  return jsonSuccess({ message: "Votre mot de passe a été modifié." });
}
