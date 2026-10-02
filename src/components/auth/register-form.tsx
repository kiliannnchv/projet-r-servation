"use client";

import { useRouter } from "next/navigation";
import { useApiForm } from "@/hooks/use-api-form";
import { safeRedirect } from "@/lib/redirect";
import { toast } from "@/lib/toast";
import { Alert } from "@/components/ui/alert";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

/** Rappel des règles de mot de passe (identiques à la validation serveur). */
export const PASSWORD_HINT = "8 caractères minimum, avec une majuscule, une minuscule et un chiffre.";

/** Formulaire d'inscription : appelle POST /api/register. */
export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const { handleSubmit, pending, message, fieldErrors } = useApiForm({
    url: "/api/register",
    method: "POST",
    onSuccess: (result) => {
      if (result.message) toast("success", result.message);
      router.push(safeRedirect(redirectTo, "/activites"));
      router.refresh(); // L'utilisateur est connecté automatiquement
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message && <Alert tone="error">{message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField name="prenom" label="Prénom" autoComplete="given-name" errors={fieldErrors.prenom} required autoFocus />
        <InputField name="nom" label="Nom" autoComplete="family-name" errors={fieldErrors.nom} required />
      </div>
      <InputField
        name="email"
        type="email"
        label="Adresse e-mail"
        autoComplete="email"
        placeholder="vous@exemple.fr"
        errors={fieldErrors.email}
        required
      />
      <InputField
        name="password"
        type="password"
        label="Mot de passe"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        errors={fieldErrors.password}
        required
      />
      <InputField
        name="confirmPassword"
        type="password"
        label="Confirmation du mot de passe"
        autoComplete="new-password"
        errors={fieldErrors.confirmPassword}
        required
      />

      <SubmitButton pending={pending} size="lg" className="w-full" pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>
    </form>
  );
}
