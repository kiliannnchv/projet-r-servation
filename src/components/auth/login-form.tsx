"use client";

import { useRouter } from "next/navigation";
import { useApiForm } from "@/hooks/use-api-form";
import { safeRedirect } from "@/lib/redirect";
import { toast } from "@/lib/toast";
import type { Role } from "@/types/models";
import { Alert } from "@/components/ui/alert";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

/** Formulaire de connexion : appelle POST /api/login. */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const { handleSubmit, pending, message, fieldErrors } = useApiForm<{ role: Role }>({
    url: "/api/login",
    method: "POST",
    onSuccess: (result) => {
      if (result.message) toast("success", result.message);
      // Retour à la page demandée, sinon l'accueil adapté au rôle.
      const fallback = result.data?.role === "admin" ? "/admin" : "/activites";
      router.push(safeRedirect(redirectTo, fallback));
      router.refresh(); // Met à jour l'en-tête (utilisateur connecté)
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message && <Alert tone="error">{message}</Alert>}

      <InputField
        name="email"
        type="email"
        label="Adresse e-mail"
        autoComplete="email"
        placeholder="vous@exemple.fr"
        errors={fieldErrors.email}
        required
        autoFocus
      />
      <InputField
        name="password"
        type="password"
        label="Mot de passe"
        autoComplete="current-password"
        errors={fieldErrors.password}
        required
      />

      <SubmitButton pending={pending} size="lg" className="w-full" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}
