import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, Ticket } from "lucide-react";
import { listUserReservations, type ReservationDetail } from "@/data/reservations";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime, formatDuration, formatTime } from "@/lib/format";
import clsx from "clsx";
import { getTypeVisual } from "@/components/activites/type-visual";
import { TypeBadge } from "@/components/activites/type-badge";
import { ActionButton } from "@/components/ui/action-button";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Mes réservations",
  description: "Consultez vos réservations à venir, passées et annulées.",
};

type Statut = "a-venir" | "passee" | "annulee";

const STATUT_LABEL: Record<Statut, { label: string; className: string }> = {
  "a-venir": { label: "Confirmée", className: "bg-forest-50 text-forest-700 ring-forest-200" },
  passee: { label: "Terminée", className: "bg-stone-100 text-stone-600 ring-stone-200" },
  annulee: { label: "Annulée", className: "bg-red-50 text-red-700 ring-red-200" },
};

/** Détermine le statut affiché d'une réservation. */
function getStatut(reservation: ReservationDetail, now: Date): Statut {
  if (!reservation.etat) return "annulee";
  return reservation.activite.datetimeDebut > now ? "a-venir" : "passee";
}

/** Ligne d'une réservation. */
function ReservationItem({ reservation, statut }: { reservation: ReservationDetail; statut: Statut }) {
  const { activite } = reservation;
  const { icon: Icon, gradient } = getTypeVisual(activite.type);
  const badge = STATUT_LABEL[statut];

  return (
    <li className={clsx("flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-stone-200 sm:flex-row sm:items-center", statut !== "a-venir" && "opacity-75")}>
      <div className={clsx("grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white", gradient)}>
        <Icon aria-hidden className="size-7" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={activite.type} />
          <span className={clsx("rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", badge.className)}>{badge.label}</span>
        </div>
        <Link href={`/activites/${activite.id}`} className="mt-2 block font-display text-lg font-semibold text-stone-900 hover:text-forest-700">
          {activite.nom}
        </Link>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          <span className="inline-flex items-center gap-1.5 first-letter:uppercase">
            <CalendarDays aria-hidden className="size-4 text-stone-400" />
            {formatDate(activite.datetimeDebut)} à {formatTime(activite.datetimeDebut)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-stone-400" />
            {formatDuration(activite.duree)}
          </span>
        </div>
        <p className="mt-1 text-xs text-stone-400">Réservée le {formatDateTime(reservation.dateReservation)}</p>
      </div>

      {statut === "a-venir" && (
        <ActionButton
          request={{ url: `/api/reservations/${reservation.id}`, method: "DELETE" }}
          variant="outline-danger"
          size="sm"
          confirm={{
            title: "Annuler la réservation ?",
            description: `Votre place pour « ${activite.nom} » sera libérée.`,
            confirmLabel: "Annuler ma réservation",
          }}
        >
          Annuler
        </ActionButton>
      )}
    </li>
  );
}

/** Groupe de réservations avec un titre. */
function Group({ title, items, statut }: { title: string; items: ReservationDetail[]; statut: Statut }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold tracking-wider text-stone-500 uppercase">
        {title} <span className="text-stone-400">· {items.length}</span>
      </h2>
      <ul className="space-y-3">
        {items.map((reservation) => (
          <ReservationItem key={reservation.id} reservation={reservation} statut={statut} />
        ))}
      </ul>
    </section>
  );
}

export default async function ReservationsPage() {
  const user = await requireUser("/reservations");
  const reservations = await listUserReservations(user.id);
  const now = new Date();

  const byStatut = (statut: Statut) => reservations.filter((r) => getStatut(r, now) === statut);
  // Les prochaines sessions d'abord, dans l'ordre chronologique.
  const aVenir = byStatut("a-venir").sort(
    (a, b) => a.activite.datetimeDebut.getTime() - b.activite.datetimeDebut.getTime(),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Mon compte"
        title="Mes réservations"
        description="Retrouvez toutes vos sessions et annulez-les si besoin, jusqu'au début de l'activité."
        actions={
          <Link href="/activites" className={buttonClasses("primary")}>
            Réserver une activité
          </Link>
        }
      />

      {reservations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Aucune réservation pour l'instant"
          description="Parcourez le programme et réservez votre première aventure !"
          action={
            <Link href="/activites" className={buttonClasses("primary")}>
              Découvrir les activités
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          <Group title="À venir" items={aVenir} statut="a-venir" />
          <Group title="Passées" items={byStatut("passee")} statut="passee" />
          <Group title="Annulées" items={byStatut("annulee")} statut="annulee" />
        </div>
      )}
    </div>
  );
}
