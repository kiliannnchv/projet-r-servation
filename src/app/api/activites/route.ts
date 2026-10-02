/**
 * POST /api/activites — création d'une activité (administrateurs).
 * Corps : { nom, typeId, placesDisponibles, description, datetimeDebut, duree }
 */
import { createActivite, findType } from "@/data/activites";
import { jsonError, jsonSuccess, parseBody, requireApiAdmin } from "@/lib/api-server";
import { activiteSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, activiteSchema);
  if (!body.ok) return body.response;
  const data = body.value;

  if (data.datetimeDebut <= new Date()) {
    return jsonError("Certains champs sont invalides.", 400, {
      datetimeDebut: ["La date doit être dans le futur."],
    });
  }
  if (!(await findType(data.typeId))) {
    return jsonError("Certains champs sont invalides.", 400, { typeId: ["Ce type d'activité n'existe pas."] });
  }

  const id = await createActivite(data);
  return jsonSuccess<{ id: number }>({ message: `L'activité « ${data.nom} » a été créée.`, data: { id } }, 201);
}
