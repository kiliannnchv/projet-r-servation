import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Eye, Pencil, Plus, Tags, Ticket, Trash2, Users } from "lucide-react";
import { listActivites } from "@/data/activites";
import { getAdminStats } from "@/data/reservations";
import { formatDateTime } from "@/lib/format";
import clsx from "clsx";
import { CapacityBar } from "@/components/activites/capacity-bar";
import { TypeBadge } from "@/components/activites/type-badge";
import { ActionButton } from "@/components/ui/action-button";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration",
  description: "Tableau de bord de gestion des activités et des réservations.",
};

export default async function AdminPage() {
  const [stats, toutes] = await Promise.all([getAdminStats(), listActivites({ includePast: true })]);
  const now = new Date();
  // Sessions à venir d'abord (de la plus proche à la plus lointaine), puis l'historique.
  const activites = [
    ...toutes.filter((a) => a.datetimeDebut > now).reverse(),
    ...toutes.filter((a) => a.datetimeDebut <= now),
  ];

  const cards = [
    { label: "Sessions à venir", value: stats.activitesAVenir, icon: CalendarRange },
    { label: "Réservations actives", value: stats.reservationsActives, icon: Ticket },
    { label: "Utilisateurs inscrits", value: stats.utilisateurs, icon: Users },
    { label: "Types d'activités", value: stats.types, icon: Tags },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Tableau de bord"
        description="Gérez le programme des activités du parc."
        actions={
          <Link href="/admin/activites/nouvelle" className={buttonClasses("primary")}>
            <Plus aria-hidden className="size-4" /> Nouvelle activité
          </Link>
        }
      />

      {/* Chiffres clés */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
            <Icon aria-hidden className="size-5 text-forest-600" />
            <p className="mt-3 font-display text-3xl font-bold text-stone-900">{value}</p>
            <p className="text-sm text-stone-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Liste de toutes les activités */}
      <section aria-labelledby="activites-title" className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200">
        <h2 id="activites-title" className="border-b border-stone-100 px-6 py-4 font-display text-lg font-semibold text-stone-900">
          Toutes les activités <span className="text-stone-400">({activites.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-stone-50 text-xs tracking-wider text-stone-500 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">Activité</th>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="w-48 px-4 py-3 font-semibold">Remplissage</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {activites.map((activite) => {
                const past = activite.datetimeDebut <= now;
                return (
                  <tr key={activite.id} className={clsx("align-middle", past && "bg-stone-50/60 text-stone-500")}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{activite.nom}</p>
                      <TypeBadge type={activite.type} className="mt-1.5" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatDateTime(activite.datetimeDebut)}
                      {past && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs">Passée</span>}
                    </td>
                    <td className="px-4 py-4">
                      <CapacityBar placesRestantes={activite.placesRestantes} placesDisponibles={activite.placesDisponibles} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Link href={`/activites/${activite.id}`} className={buttonClasses("ghost", "sm")} aria-label={`Voir ${activite.nom}`}>
                          <Eye aria-hidden className="size-4" />
                        </Link>
                        <Link
                          href={`/admin/activites/${activite.id}/modifier`}
                          className={buttonClasses("ghost", "sm")}
                          aria-label={`Modifier ${activite.nom}`}
                        >
                          <Pencil aria-hidden className="size-4" />
                        </Link>
                        <ActionButton
                          request={{ url: `/api/activites/${activite.id}`, method: "DELETE" }}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          confirm={{
                            title: "Supprimer cette activité ?",
                            description: `« ${activite.nom} » et toutes ses réservations seront définitivement supprimées.`,
                            confirmLabel: "Supprimer",
                          }}
                        >
                          <Trash2 aria-label={`Supprimer ${activite.nom}`} className="size-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
