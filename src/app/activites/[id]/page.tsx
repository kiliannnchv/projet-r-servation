import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Hourglass, Pencil, Trash2, Users } from "lucide-react";
import { getActivite } from "@/data/activites";
import { findActiveReservation, listParticipants } from "@/data/reservations";
import { getCurrentUser } from "@/lib/auth";
import { idSchema } from "@/lib/validation";
import { formatDate, formatDateTime, formatDuration, formatTime, getEndDate, plural } from "@/lib/format";
import clsx from "clsx";
import { CapacityBar } from "@/components/activites/capacity-bar";
import { TypeBadge } from "@/components/activites/type-badge";
import { getTypeVisual } from "@/components/activites/type-visual";
import { ActionButton } from "@/components/ui/action-button";
import { Alert } from "@/components/ui/alert";
import { Button, buttonClasses } from "@/components/ui/button";

/** Charge l'activité de l'URL ; une URL invalide mène à la page 404. */
async function loadActivite(params: PageProps<"/activites/[id]">["params"]) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const activite = await getActivite(id.data);
  if (!activite) notFound();
  return activite;
}

export async function generateMetadata({ params }: PageProps<"/activites/[id]">): Promise<Metadata> {
  const activite = await loadActivite(params);
  return {
    title: activite.nom,
    description: `${activite.type.nom} le ${formatDate(activite.datetimeDebut)} à ${formatTime(
      activite.datetimeDebut,
    )} — ${activite.description.slice(0, 140)}`,
  };
}

export default async function ActivitePage({ params }: PageProps<"/activites/[id]">) {
  const activite = await loadActivite(params);
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";

  const [reservation, participants] = await Promise.all([
    user ? findActiveReservation(user.id, activite.id) : null,
    isAdmin ? listParticipants(activite.id) : [],
  ]);

  const { icon: Icon, gradient } = getTypeVisual(activite.type);
  const started = activite.datetimeDebut <= new Date();
  const full = activite.placesRestantes === 0;
  const end = getEndDate(activite.datetimeDebut, activite.duree);

  const details = [
    { icon: CalendarDays, label: "Date", value: formatDate(activite.datetimeDebut) },
    { icon: Clock, label: "Horaires", value: `${formatTime(activite.datetimeDebut)} – ${formatTime(end)}` },
    { icon: Hourglass, label: "Durée", value: formatDuration(activite.duree) },
    { icon: Users, label: "Capacité", value: plural(activite.placesDisponibles, "personne") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/activites" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900">
        <ArrowLeft aria-hidden className="size-4" /> Toutes les activités
      </Link>

      {/* Bannière */}
      <div className={clsx("relative overflow-hidden rounded-3xl bg-linear-to-br p-8 text-white sm:p-10", gradient)}>
        <Icon aria-hidden className="absolute -right-6 -bottom-10 size-64 text-white/15" />
        <div className="relative">
          <TypeBadge type={activite.type} className="bg-white/95" />
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">{activite.nom}</h1>
          <p className="mt-3 text-white/90">
            {formatDate(activite.datetimeDebut)} · {formatTime(activite.datetimeDebut)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Colonne principale */}
        <div className="space-y-8">
          <section aria-labelledby="desc-title" className="rounded-3xl bg-white p-6 ring-1 ring-stone-200 sm:p-8">
            <h2 id="desc-title" className="font-display text-xl font-semibold text-stone-900">
              Description
            </h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-stone-700">{activite.description}</p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {details.map(({ icon: DetailIcon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4">
                  <DetailIcon aria-hidden className="size-5 shrink-0 text-forest-600" />
                  <div>
                    <dt className="text-xs text-stone-500">{label}</dt>
                    <dd className="text-sm font-medium text-stone-900 first-letter:uppercase">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Participants : visible uniquement par les administrateurs */}
          {isAdmin && (
            <section aria-labelledby="participants-title" className="rounded-3xl bg-white p-6 ring-1 ring-stone-200 sm:p-8">
              <h2 id="participants-title" className="font-display text-xl font-semibold text-stone-900">
                Participants <span className="text-stone-400">({participants.length})</span>
              </h2>
              {participants.length > 0 ? (
                <ul className="mt-4 divide-y divide-stone-100">
                  {participants.map((p) => (
                    <li key={p.reservationId} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <div>
                        <p className="font-medium text-stone-900">
                          {p.prenom} {p.nom}
                        </p>
                        <p className="text-stone-500">{p.email}</p>
                      </div>
                      <span className="text-xs text-stone-500">Réservé le {formatDateTime(p.dateReservation)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-stone-500">Aucune réservation pour le moment.</p>
              )}
            </section>
          )}
        </div>

        {/* Colonne de réservation */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <h2 className="font-display text-lg font-semibold text-stone-900">Réservation</h2>
            <CapacityBar
              className="mt-4"
              placesRestantes={activite.placesRestantes}
              placesDisponibles={activite.placesDisponibles}
            />

            <div className="mt-6 space-y-3">
              {started ? (
                <Alert tone="info">Cette session a déjà commencé ou est terminée.</Alert>
              ) : reservation ? (
                <>
                  <Alert tone="success">Vous êtes inscrit·e à cette session. À bientôt !</Alert>
                  <ActionButton
                    request={{ url: `/api/reservations/${reservation.id}`, method: "DELETE" }}
                    variant="outline-danger"
                    className="w-full"
                    confirm={{
                      title: "Annuler la réservation ?",
                      description: `Votre place pour « ${activite.nom} » sera libérée pour une autre personne.`,
                      confirmLabel: "Annuler ma réservation",
                    }}
                  >
                    Annuler ma réservation
                  </ActionButton>
                </>
              ) : !user ? (
                <>
                  <Link
                    href={`/connexion?redirect=/activites/${activite.id}`}
                    className={clsx(buttonClasses("primary", "lg"), "w-full")}
                  >
                    Se connecter pour réserver
                  </Link>
                  <p className="text-center text-xs text-stone-500">
                    Pas encore de compte ?{" "}
                    <Link href={`/inscription?redirect=/activites/${activite.id}`} className="font-medium text-forest-700 hover:underline">
                      Inscrivez-vous
                    </Link>
                  </p>
                </>
              ) : full ? (
                <Button size="lg" className="w-full" disabled>
                  Session complète
                </Button>
              ) : (
                <ActionButton request={{ url: "/api/reservations", method: "POST", body: { activiteId: activite.id } }} size="lg" className="w-full">
                  Réserver ma place
                </ActionButton>
              )}
            </div>
          </div>

          {/* Actions d'administration */}
          {isAdmin && (
            <div className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">
              <h2 className="text-xs font-semibold tracking-wider text-stone-500 uppercase">Administration</h2>
              <div className="mt-3 flex gap-2">
                <Link href={`/admin/activites/${activite.id}/modifier`} className={clsx(buttonClasses("secondary"), "flex-1")}>
                  <Pencil aria-hidden className="size-4" /> Modifier
                </Link>
                <ActionButton
                  request={{ url: `/api/activites/${activite.id}`, method: "DELETE" }}
                  redirectTo="/admin"
                  variant="outline-danger"
                  className="flex-1"
                  confirm={{
                    title: "Supprimer cette activité ?",
                    description:
                      participants.length > 0
                        ? `« ${activite.nom} » sera définitivement supprimée, ainsi que ${plural(participants.length, "réservation active", "réservations actives")}.`
                        : `« ${activite.nom} » sera définitivement supprimée.`,
                    confirmLabel: "Supprimer",
                  }}
                >
                  <Trash2 aria-hidden className="size-4" /> Supprimer
                </ActionButton>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
