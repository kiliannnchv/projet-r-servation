/**
 * POST /api/reservations — réservation d'une place pour l'utilisateur connecté.
 * Corps : { activiteId }
 */
import { z } from "zod";
import { getActivite } from "@/data/activites";
import { createReservationIfAvailable, findActiveReservation } from "@/data/reservations";
import { jsonError, jsonSuccess, parseBody, requireApiUser } from "@/lib/api-server";
import { idSchema } from "@/lib/validation";

const reservationSchema = z.object({ activiteId: idSchema });

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  const user = auth.value;

  const body = await parseBody(req, reservationSchema);
  if (!body.ok) return body.response;
  const { activiteId } = body.value;

  // Insertion atomique : n'a lieu que si toutes les règles sont respectées.
  if (await createReservationIfAvailable(user.id, activiteId)) {
    return jsonSuccess({ message: "Réservation confirmée ! Retrouvez-la dans « Mes réservations »." }, 201);
  }

  // Refus : on identifie la règle non respectée pour afficher un message précis.
  const activite = await getActivite(activiteId);
  if (!activite) return jsonError("Cette activité n'existe pas.", 404);
  if (activite.datetimeDebut <= new Date()) {
    return jsonError("Cette activité a déjà commencé, elle n'est plus réservable.", 409);
  }
  if (await findActiveReservation(user.id, activiteId)) {
    return jsonError("Vous avez déjà réservé cette activité.", 409);
  }
  return jsonError("Désolé, cette activité est complète.", 409);
}
