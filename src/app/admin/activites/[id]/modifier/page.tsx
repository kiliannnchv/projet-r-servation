import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivite, listTypes } from "@/data/activites";
import { activiteToFormValues, plural, toDateTimeLocalValue } from "@/lib/format";
import { idSchema } from "@/lib/validation";
import { ActiviteForm } from "@/components/admin/activite-form";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";

type Props = PageProps<"/admin/activites/[id]/modifier">;

/** Charge l'activité à modifier ou affiche la page 404. */
async function loadActivite(params: Props["params"]) {
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const activite = await getActivite(id.data);
  if (!activite) notFound();
  return activite;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const activite = await loadActivite(params);
  return { title: `Modifier « ${activite.nom} »` };
}

export default async function ModifierActivitePage({ params }: Props) {
  const [activite, types] = await Promise.all([loadActivite(params), listTypes()]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Administration" title="Modifier l'activité" description={activite.nom} />
      {activite.placesReservees > 0 && (
        <Alert tone="info" className="mb-6">
          {plural(activite.placesReservees, "place est déjà réservée", "places sont déjà réservées")} : la capacité
          ne pourra pas descendre en dessous.
        </Alert>
      )}
      <ActiviteForm
        types={types}
        activite={{ id: activite.id, values: activiteToFormValues(activite) }}
        minDate={toDateTimeLocalValue(new Date())}
        cancelHref={`/activites/${activite.id}`}
      />
    </div>
  );
}
