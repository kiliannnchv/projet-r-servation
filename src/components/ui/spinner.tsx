import { LoaderCircle } from "lucide-react";
import clsx from "clsx";

/** Indicateur de chargement animé. */
export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden className={clsx("size-4 animate-spin", className)} />;
}
