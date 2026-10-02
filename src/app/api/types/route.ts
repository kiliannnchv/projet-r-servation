/**
 * POST /api/types — création d'un type d'activité (administrateurs).
 * Corps : { nom }
 */
import { createType, typeNameExists } from "@/data/activites";
import { jsonError, jsonSuccess, parseBody, requireApiAdmin } from "@/lib/api-server";
import { typeActiviteSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, typeActiviteSchema);
  if (!body.ok) return body.response;

  if (await typeNameExists(body.value.nom)) {
    return jsonError("Ce type existe déjà.", 409, { nom: ["Ce type existe déjà."] });
  }

  await createType(body.value.nom);
  return jsonSuccess({ message: `Type « ${body.value.nom} » ajouté.` }, 201);
}
