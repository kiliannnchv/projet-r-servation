import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { listTypes } from "@/data/activites";
import { plural } from "@/lib/format";
import { getTypeVisual } from "@/components/activites/type-visual";
import { CreateTypeForm, EditableTypeName } from "@/components/admin/type-forms";
import { ActionButton } from "@/components/ui/action-button";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Types d'activités",
  description: "Gérer les catégories d'activités du parc.",
};

export default async function TypesPage() {
  const types = await listTypes();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Administration"
        title="Types d'activités"
        description="Les types servent à classer les activités et à les filtrer dans le catalogue."
      />

      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">
          <CreateTypeForm />
        </div>

        <ul className="divide-y divide-stone-100 overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200">
          {types.map((type) => {
            const { icon: Icon, gradient } = getTypeVisual(type);
            return (
              <li key={type.id} className="flex items-center gap-4 px-6 py-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br ${gradient} text-white`}>
                  <Icon aria-hidden className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <EditableTypeName type={type} />
                  <p className="text-xs text-stone-500">{plural(type.nbActivites, "activité")}</p>
                </div>
                <ActionButton
                  request={{ url: `/api/types/${type.id}`, method: "DELETE" }}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  confirm={{
                    title: `Supprimer le type « ${type.nom} » ?`,
                    description:
                      type.nbActivites > 0
                        ? "Ce type est encore utilisé : la suppression sera refusée tant que des activités y sont rattachées."
                        : "Ce type n'est utilisé par aucune activité.",
                    confirmLabel: "Supprimer",
                  }}
                >
                  <Trash2 aria-label={`Supprimer ${type.nom}`} className="size-4" />
                </ActionButton>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
