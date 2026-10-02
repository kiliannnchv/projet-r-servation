"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, X } from "lucide-react";
import { useApiForm } from "@/hooks/use-api-form";
import { toast } from "@/lib/toast";
import type { TypeActivite } from "@/types/models";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

/** Formulaire d'ajout d'un type d'activité : POST /api/types. */
export function CreateTypeForm() {
  const router = useRouter();
  const { handleSubmit, pending, fieldErrors } = useApiForm({
    url: "/api/types",
    method: "POST",
    onSuccess: (result, form) => {
      if (result.message) toast("success", result.message);
      form.reset(); // Vide le champ pour un nouvel ajout
      router.refresh(); // Recharge la liste
    },
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
      <div className="flex-1">
        <InputField
          name="nom"
          id="new-type"
          label="Nouveau type"
          placeholder="Ex. Paintball"
          errors={fieldErrors.nom}
          maxLength={50}
          required
        />
      </div>
      <SubmitButton pending={pending} className="sm:mt-7" pendingLabel="Ajout…">
        <Plus aria-hidden className="size-4" /> Ajouter
      </SubmitButton>
    </form>
  );
}

/** Nom d'un type, modifiable sur place : PUT /api/types/[id]. */
export function EditableTypeName({ type }: { type: TypeActivite }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { handleSubmit, pending, fieldErrors } = useApiForm({
    url: `/api/types/${type.id}`,
    method: "PUT",
    onSuccess: (result) => {
      if (result.message) toast("success", result.message);
      setEditing(false);
      router.refresh();
    },
  });

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-stone-900">{type.nom}</span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label={`Renommer ${type.nom}`}>
          <Pencil aria-hidden className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2" noValidate>
      <div className="flex-1">
        <label htmlFor={`type-${type.id}`} className="sr-only">
          Nom du type
        </label>
        <input
          id={`type-${type.id}`}
          name="nom"
          defaultValue={type.nom}
          autoFocus
          maxLength={50}
          className="h-8 w-full rounded-lg border border-stone-300 px-2.5 text-sm focus:border-forest-500 focus:ring-4 focus:ring-forest-100 focus:outline-none"
        />
        {fieldErrors.nom && <p className="mt-1 text-xs text-red-600">{fieldErrors.nom[0]}</p>}
      </div>
      <SubmitButton pending={pending} size="sm">
        <Check aria-label="Enregistrer" className="size-4" />
      </SubmitButton>
      <Button variant="ghost" size="sm" onClick={() => setEditing(false)} aria-label="Annuler">
        <X aria-hidden className="size-4" />
      </Button>
    </form>
  );
}
