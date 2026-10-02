"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiForm } from "@/hooks/use-api-form";
import { toast } from "@/lib/toast";
import type { TypeActivite } from "@/types/models";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type ActiviteFormProps = {
  types: TypeActivite[];
  /**
   * Activité à modifier : son identifiant et les valeurs initiales des champs,
   * calculées côté serveur avec `activiteToFormValues`. Absent pour une création.
   */
  activite?: { id: number; values: Record<string, string> };
  /** Valeur minimale du champ date (heure courante), calculée côté serveur. */
  minDate: string;
  cancelHref: string;
};

/**
 * Formulaire de création (POST /api/activites) ou de modification
 * (PUT /api/activites/[id]) d'une activité.
 */
export function ActiviteForm({ types, activite, minDate, cancelHref }: ActiviteFormProps) {
  const router = useRouter();
  const { handleSubmit, pending, message, fieldErrors } = useApiForm<{ id: number }>({
    url: activite ? `/api/activites/${activite.id}` : "/api/activites",
    method: activite ? "PUT" : "POST",
    onSuccess: (result) => {
      if (result.message) toast("success", result.message);
      // Après création, l'API renvoie l'identifiant de la nouvelle activité.
      const id = activite?.id ?? result.data?.id;
      router.push(id ? `/activites/${id}` : "/admin");
      router.refresh();
    },
  });

  const values = activite?.values ?? { duree: "60", typeId: "" };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-stone-200 sm:p-8" noValidate>
      {message && <Alert tone="error">{message}</Alert>}

      <InputField name="nom" label="Nom de l'activité" placeholder="Ex. Parcours aventure" defaultValue={values.nom} errors={fieldErrors.nom} required maxLength={100} />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField name="typeId" label="Type d'activité" defaultValue={values.typeId} errors={fieldErrors.typeId} required>
          <option value="" disabled>
            Choisir un type…
          </option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.nom}
            </option>
          ))}
        </SelectField>
        <InputField
          name="placesDisponibles"
          type="number"
          min={1}
          max={500}
          label="Nombre de places"
          defaultValue={values.placesDisponibles}
          errors={fieldErrors.placesDisponibles}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <InputField
          name="datetimeDebut"
          type="datetime-local"
          min={minDate}
          label="Date et heure de début"
          defaultValue={values.datetimeDebut}
          errors={fieldErrors.datetimeDebut}
          required
        />
        <InputField
          name="duree"
          type="number"
          min={15}
          max={1440}
          step={5}
          label="Durée (en minutes)"
          hint="Par exemple 90 pour 1 h 30."
          defaultValue={values.duree}
          errors={fieldErrors.duree}
          required
        />
      </div>

      <TextareaField
        name="description"
        label="Description"
        placeholder="Déroulé, niveau requis, âge minimum, matériel fourni…"
        defaultValue={values.description}
        errors={fieldErrors.description}
        required
        maxLength={2000}
      />

      <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonClasses("secondary")}>
          Annuler
        </Link>
        <SubmitButton pending={pending} pendingLabel="Enregistrement…">
          {activite ? "Enregistrer les modifications" : "Créer l'activité"}
        </SubmitButton>
      </div>
    </form>
  );
}
