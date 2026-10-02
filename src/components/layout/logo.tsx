import Link from "next/link";
import { TreePine } from "lucide-react";

/** Nom du parc, utilisé dans le logo et les métadonnées. */
export const SITE_NAME = "Parc des Cimes";

/** Logo cliquable menant à l'accueil. */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-forest-600">
      <span className="grid size-9 place-items-center rounded-xl bg-forest-600 text-white shadow-sm">
        <TreePine aria-hidden className="size-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-stone-900">{SITE_NAME}</span>
    </Link>
  );
}
