import type { Metadata } from "next";
import Link from "next/link";
import { Plus, SearchX } from "lucide-react";
import { listActivites, listTypes } from "@/data/activites";
import { listReservedActiviteIds } from "@/data/reservations";
import { getCurrentUser } from "@/lib/auth";
import { plural } from "@/lib/format";
import { ActiviteCard } from "@/components/activites/activite-card";
import { ActiviteFilters } from "@/components/activites/activite-filters";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

type SearchParams = Awaited<PageProps<"/activites">["searchParams"]>;

/** Lit et normalise les filtres présents dans l'URL. */
function parseFilters(searchParams: SearchParams) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim().slice(0, 100) : "";
  const type = Number(searchParams.type);
  return { search: q, typeId: Number.isInteger(type) && type > 0 ? type : undefined };
}

/** Le titre de l'onglet reflète la recherche en cours. */
export async function generateMetadata({ searchParams }: PageProps<"/activites">): Promise<Metadata> {
  const { search } = parseFilters(await searchParams);
  return {
    title: search ? `Recherche « ${search} »` : "Activités",
    description: "Toutes les sessions d'activités à venir du parc : consultez les places restantes et réservez en ligne.",
  };
}

export default async function ActivitesPage({ searchParams }: PageProps<"/activites">) {
  const { search, typeId } = parseFilters(await searchParams);
  const user = await getCurrentUser();

  const [activites, types, reservedIds] = await Promise.all([
    listActivites({ search, typeId }),
    listTypes(),
    user ? listReservedActiviteIds(user.id) : Promise.resolve(new Set<number>()),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Programme"
        title="Activités à venir"
        description="Trouvez l'activité qui vous ressemble et réservez votre place en un clic."
        actions={
          user?.role === "admin" && (
            <Link href="/admin/activites/nouvelle" className={buttonClasses("primary")}>
              <Plus aria-hidden className="size-4" /> Nouvelle activité
            </Link>
          )
        }
      />

      <ActiviteFilters types={types} search={search} typeId={typeId} />

      {activites.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-stone-500" aria-live="polite">
            {plural(activites.length, "session trouvée", "sessions trouvées")}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activites.map((activite) => (
              <ActiviteCard key={activite.id} activite={activite} reserved={reservedIds.has(activite.id)} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Aucune activité trouvée"
          description={
            search
              ? `Aucune session à venir ne correspond à « ${search} ». Essayez un autre mot-clé.`
              : "Aucune session n'est programmée pour le moment dans cette catégorie."
          }
          action={
            <Link href="/activites" className={buttonClasses("secondary")}>
              Voir toutes les activités
            </Link>
          }
        />
      )}
    </div>
  );
}
