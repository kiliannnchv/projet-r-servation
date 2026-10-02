import Form from "next/form";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { TypeActivite } from "@/types/models";
import clsx from "clsx";
import { buttonClasses } from "@/components/ui/button";

type ActiviteFiltersProps = {
  types: TypeActivite[];
  search: string;
  typeId?: number;
};

/** Construit l'URL de la liste en conservant les filtres non modifiés. */
function filtersHref(search: string, typeId?: number): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (typeId) params.set("type", String(typeId));
  const query = params.toString();
  return query ? `/activites?${query}` : "/activites";
}

/**
 * Barre de recherche par nom (formulaire GET, fonctionne sans JavaScript)
 * et filtres par type sous forme de pastilles.
 */
export function ActiviteFilters({ types, search, typeId }: ActiviteFiltersProps) {
  const chip = (active: boolean) =>
    clsx(
      "rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition",
      active
        ? "bg-forest-600 text-white ring-forest-600"
        : "bg-white text-stone-700 ring-stone-300 hover:bg-stone-50",
    );

  return (
    <div className="mb-8 space-y-4">
      <Form action="/activites" role="search" className="flex gap-2">
        {typeId && <input type="hidden" name="type" value={typeId} />}
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
          <label htmlFor="q" className="sr-only">
            Rechercher une activité par nom
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Rechercher une activité (ex. kayak, parcours…)"
            className="h-12 w-full rounded-2xl border border-stone-300 bg-white pr-4 pl-10 text-sm shadow-xs placeholder:text-stone-400 focus:border-forest-500 focus:ring-4 focus:ring-forest-100 focus:outline-none"
          />
        </div>
        <button type="submit" className={buttonClasses("primary", "lg")}>
          Rechercher
        </button>
      </Form>

      <nav aria-label="Filtrer par type" className="flex flex-wrap items-center gap-2">
        <Link href={filtersHref(search)} className={chip(!typeId)} aria-current={!typeId ? "true" : undefined}>
          Toutes
        </Link>
        {types.map((type) => (
          <Link
            key={type.id}
            href={filtersHref(search, type.id)}
            className={chip(typeId === type.id)}
            aria-current={typeId === type.id ? "true" : undefined}
          >
            {type.nom}
          </Link>
        ))}
        {(search || typeId) && (
          <Link href="/activites" className="ml-auto inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
            <X aria-hidden className="size-4" /> Réinitialiser
          </Link>
        )}
      </nav>
    </div>
  );
}
