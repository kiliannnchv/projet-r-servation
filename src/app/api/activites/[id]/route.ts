/**
 * /api/activites/[id] — gestion d'une activité (administrateurs).
 *   PUT    : modification — corps : { nom, typeId, placesDisponibles, description, datetimeDebut, duree }
 *   DELETE : suppression (les réservations sont supprimées en cascade)
 */
import { deleteActivite, findType, getActivite, updateActivite } from "@/data/activites";
import { jsonError, jsonSuccess, parseBody, parseId, requireApiAdmin } from "@/lib/api-server";
import { activiteSchema } from "@/lib/validation";

export async function PUT(req: Request, ctx: RouteContext<"/api/activites/[id]">) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const id = parseId((await ctx.params).id);
  const existing = id ? await getActivite(id) : null;
  if (!id || !existing) return jsonError("Cette activité n'existe pas.", 404);

  const body = await parseBody(req, activiteSchema);
  if (!body.ok) return body.response;
  const data = body.value;

  // Une date passée n'est acceptée que si elle n'a pas été modifiée.
  const dateChanged = existing.datetimeDebut.getTime() !== data.datetimeDebut.getTime();
  if (dateChanged && data.datetimeDebut <= new Date()) {
    return jsonError("Certains champs sont invalides.", 400, {
      datetimeDebut: ["La date doit être dans le futur."],
    });
  }
  if (!(await findType(data.typeId))) {
    return jsonError("Certains champs sont invalides.", 400, { typeId: ["Ce type d'activité n'existe pas."] });
  }
  // La capacité ne peut pas descendre sous le nombre de places déjà réservées.
  if (data.placesDisponibles < existing.placesReservees) {
    return jsonError("Certains champs sont invalides.", 400, {
      placesDisponibles: [
        `${existing.placesReservees} places sont déjà réservées : la capacité ne peut pas être inférieure.`,
      ],
    });
  }

  await updateActivite(id, data);
  return jsonSuccess({ message: `L'activité « ${data.nom} » a été modifiée.` });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/activites/[id]">) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const id = parseId((await ctx.params).id);
  const existing = id ? await getActivite(id) : null;
  if (!id || !existing) return jsonError("Cette activité n'existe pas.", 404);

  await deleteActivite(id);
  return jsonSuccess({ message: `L'activité « ${existing.nom} » a été supprimée.` });
}
