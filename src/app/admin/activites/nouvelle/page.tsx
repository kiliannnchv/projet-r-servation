import type { Metadata } from "next";
import Link from "next/link";
import { listTypes } from "@/data/activites";
import { toDateTimeLocalValue } from "@/lib/format";
import { ActiviteForm } from "@/components/admin/activite-form";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Nouvelle activité",
  description: "Programmer une nouvelle session d'activité.",
};

export default async function NouvelleActivitePage() {
  const types = await listTypes();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Administration" title="Nouvelle activité" description="Programmez une nouvelle session ouverte à la réservation." />
      {types.length === 0 ? (
        <Alert tone="info">
          Créez d&apos;abord un{" "}
          <Link href="/admin/types" className="font-semibold underline">
            type d&apos;activité
          </Link>{" "}
          avant de programmer une activité.
        </Alert>
      ) : (
        <ActiviteForm types={types} minDate={toDateTimeLocalValue(new Date())} cancelHref="/admin" />
      )}
    </div>
  );
}
