import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline-danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-forest-600 text-white shadow-sm hover:bg-forest-700 focus-visible:outline-forest-600",
  secondary:
    "bg-white text-stone-800 ring-1 ring-inset ring-stone-300 shadow-sm hover:bg-stone-50 focus-visible:outline-forest-600",
  ghost: "text-stone-700 hover:bg-stone-100 focus-visible:outline-forest-600",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600",
  "outline-danger":
    "bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50 focus-visible:outline-red-600",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
};

/**
 * Classes d'un bouton : réutilisables sur un `<Link>` pour lui donner
 * l'apparence d'un bouton.
 */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return clsx(
    "inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** Bouton générique du design system. */
export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={clsx(buttonClasses(variant, size), className)} {...props} />;
}
