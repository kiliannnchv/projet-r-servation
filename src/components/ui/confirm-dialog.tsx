"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, type ButtonVariant } from "./button";
import { Spinner } from "./spinner";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * Boîte de dialogue de confirmation basée sur l'élément natif `<dialog>`
 * (gestion du focus, touche Échap et arrière-plan fournis par le navigateur).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Synchronise l'état React avec l'ouverture du <dialog> natif.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clic sur l'arrière-plan : on ferme.
      onClick={(event) => event.target === dialogRef.current && !pending && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-stone-950/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
            <TriangleAlert aria-hidden className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-stone-900">{title}</h2>
            <div className="mt-1 text-sm text-stone-600">{description}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={pending}>
            {pending && <Spinner />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
