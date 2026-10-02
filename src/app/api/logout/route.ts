/**
 * POST /api/logout — déconnexion : suppression du cookie de session.
 */
import { jsonSuccess } from "@/lib/api-server";
import { logout } from "@/utils/sessions";

export async function POST() {
  await logout();
  return jsonSuccess({ message: "Vous êtes déconnecté. À bientôt !" });
}
