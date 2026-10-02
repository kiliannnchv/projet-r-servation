/**
 * /api/types/[id] — gestion d'un type d'activité (administrateurs).
 *   PUT    : renommage — corps : { nom }
 *   DELETE : suppression, refusée si des activités utilisent ce type
 */
import { countActivitesByType, deleteType, findType, renameType, typeNameExists } from "@/data/activites";
import { jsonError, jsonSuccess, parseBody, parseId, requireApiAdmin } from "@/lib/api-server";
import { typeActiviteSchema } from "@/lib/validation";

export async function PUT(req: Request, ctx: RouteContext<"/api/types/[id]">) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const id = parseId((await ctx.params).id);
  if (!id || !(await findType(id))) return jsonError("Ce type n'existe pas.", 404);

  const body = await parseBody(req, typeActiviteSchema);
  if (!body.ok) return body.response;

  if (await typeNameExists(body.value.nom, id)) {
    return jsonError("Ce type existe déjà.", 409, { nom: ["Ce type existe déjà."] });
  }

  await renameType(id, body.value.nom);
  return jsonSuccess({ message: "Type renommé." });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/types/[id]">) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const id = parseId((await ctx.params).id);
  if (!id || !(await findType(id))) return jsonError("Ce type n'existe pas.", 404);

  if ((await countActivitesByType(id)) > 0) {
    return jsonError(
      "Ce type est utilisé par des activités : supprimez-les ou changez leur type d'abord.",
      409,
    );
  }

  await deleteType(id);
  return jsonSuccess({ message: "Type supprimé." });
}
