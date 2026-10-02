"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useApiForm } from "@/hooks/use-api-form";
import { toast } from "@/lib/toast";
import type { PublicUser } from "@/types/models";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { PASSWORD_HINT } from "@/components/auth/register-form";

/** Modification du prénom, du nom et de l'e-mail : PATCH /api/profil. */
export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const { handleSubmit, pending, message, fieldErrors } = useApiForm({
    url: "/api/profil",
    method: "PATCH",
    onSuccess: (result) => {
      if (result.message) toast("success", result.message);
      router.refresh(); // Le prénom apparaît dans l'en-tête
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message && <Alert tone="error">{message}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField name="prenom" label="Prénom" autoComplete="given-name" defaultValue={user.prenom} errors={fieldErrors.prenom} required />
        <InputField name="nom" label="Nom" autoComplete="family-name" defaultValue={user.nom} errors={fieldErrors.nom} required />
      </div>
      <InputField name="email" type="email" label="Adresse e-mail" autoComplete="email" defaultValue={user.email} errors={fieldErrors.email} required />
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Enregistrement…">
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  );
}

/** Changement de mot de passe : PUT /api/profil/mot-de-passe. */
export function PasswordForm() {
  const { handleSubmit, pending, message, fieldErrors } = useApiForm({
    url: "/api/profil/mot-de-passe",
    method: "PUT",
    onSuccess: (result, form) => {
      if (result.message) toast("success", result.message);
      form.reset(); // On vide les champs de mot de passe
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {message && <Alert tone="error">{message}</Alert>}
      <InputField name="currentPassword" type="password" label="Mot de passe actuel" autoComplete="current-password" errors={fieldErrors.currentPassword} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField name="newPassword" type="password" label="Nouveau mot de passe" autoComplete="new-password" hint={PASSWORD_HINT} errors={fieldErrors.newPassword} required />
        <InputField name="confirmPassword" type="password" label="Confirmation" autoComplete="new-password" errors={fieldErrors.confirmPassword} required />
      </div>
      <div className="flex justify-end">
        <SubmitButton pending={pending} pendingLabel="Modification…">
          Changer le mot de passe
        </SubmitButton>
      </div>
    </form>
  );
}

/**
 * Suppression du compte : ouvre une boîte de dialogue demandant le mot de passe,
 * puis appelle DELETE /api/profil.
 */
export function DeleteAccountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { handleSubmit, pending, message, fieldErrors } = useApiForm({
    url: "/api/profil",
    method: "DELETE",
    onSuccess: (result) => {
      if (result.message) toast("info", result.message);
      router.push("/");
      router.refresh(); // L'utilisateur est déconnecté
    },
  });

  // Synchronise l'état React avec l'ouverture du <dialog> natif.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden className="size-4" /> Supprimer mon compte
      </Button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-labelledby="delete-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-stone-950/40 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
          <div>
            <h2 id="delete-title" className="font-display text-lg font-semibold text-stone-900">
              Supprimer définitivement votre compte ?
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Toutes vos réservations seront supprimées. Cette action est irréversible.
            </p>
          </div>
          {message && <Alert tone="error">{message}</Alert>}
          <InputField
            name="password"
            id="delete-password"
            type="password"
            label="Confirmez avec votre mot de passe"
            autoComplete="current-password"
            errors={fieldErrors.password}
            required
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <SubmitButton pending={pending} variant="danger" pendingLabel="Suppression…">
              Supprimer mon compte
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
