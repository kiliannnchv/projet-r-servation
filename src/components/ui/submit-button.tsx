import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { Spinner } from "./spinner";

type SubmitButtonProps = {
  children: ReactNode;
  /** Le formulaire est en cours d'envoi. */
  pending: boolean;
  /** Texte affiché pendant l'envoi. */
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/**
 * Bouton de soumission qui se désactive et affiche un spinner pendant l'envoi,
 * pour éviter les doubles clics.
 */
export function SubmitButton({ children, pending, pendingLabel, variant, size, className }: SubmitButtonProps) {
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending} aria-busy={pending}>
      {pending && <Spinner />}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
