"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { callApi, type HttpMethod } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { ConfirmDialog } from "./confirm-dialog";
import { Spinner } from "./spinner";

type ActionButtonProps = {
  /** Requête à envoyer à l'API. */
  request: { url: string; method: HttpMethod; body?: unknown };
  /** Page vers laquelle rediriger après succès ; sinon la page courante est rafraîchie. */
  redirectTo?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Si fourni, une confirmation est demandée avant l'envoi. */
  confirm?: {
    title: string;
    description: ReactNode;
    confirmLabel: string;
  };
};

/**
 * Bouton qui appelle une route de l'API (réserver, annuler, supprimer…),
 * avec confirmation optionnelle et notification du résultat.
 */
export function ActionButton({ request, redirectTo, children, variant, size, className, confirm }: ActionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const run = async () => {
    setPending(true);
    const result = await callApi(request.url, request.method, request.body);
    setPending(false);
    setDialogOpen(false);

    if (!result.ok) {
      toast("error", result.message);
      return;
    }
    if (result.message) toast("success", result.message);
    if (redirectTo) router.push(redirectTo);
    router.refresh(); // Recharge les données affichées par les composants serveur
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={pending}
        aria-busy={pending}
        onClick={confirm ? () => setDialogOpen(true) : run}
      >
        {pending && !confirm && <Spinner />}
        {children}
      </Button>
      {confirm && (
        <ConfirmDialog
          open={dialogOpen}
          pending={pending}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          onConfirm={run}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
