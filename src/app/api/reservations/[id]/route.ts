/**
 * DELETE /api/reservations/[id] — annulation d'une réservation.
 *
 * L'annulation est « logique » : la ligne est conservée avec `etat = false`
 * pour garder l'historique (onglet « Annulées » de « Mes réservations »).
 */
import { cancelReservation, findReservation } from "@/data/reservations";
import { jsonError, jsonSuccess, parseId, requireApiUser } from "@/lib/api-server";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/reservations/[id]">) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const user = auth.value;

  const id = parseId((await ctx.params).id);
  const reservation = id ? await findReservation(id) : null;

  // Une réservation inexistante et celle d'un autre utilisateur donnent la même
  // réponse : on ne divulgue pas l'existence des réservations des autres.
  if (!reservation || reservation.userId !== user.id) {
    return jsonError("Cette réservation ne vous appartient pas.", 403);
  }
  if (!reservation.etat) {
    return jsonError("Cette réservation est déjà annulée.", 409);
  }
  if (reservation.activiteDebut <= new Date()) {
    return jsonError("L'activité a déjà commencé : la réservation ne peut plus être annulée.", 409);
  }

  await cancelReservation(reservation.id, user.id);
  return jsonSuccess({ message: "Votre réservation a été annulée." });
}
