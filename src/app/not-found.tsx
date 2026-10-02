import type { Metadata } from "next";
import Link from "next/link";
import { Compass, TreePine } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

/** Page 404 stylisée, affichée pour toute URL inconnue ou ressource inexistante. */
export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100dvh-10rem)] items-center justify-center overflow-hidden px-4 py-16">
      {/* Petite forêt décorative en arrière-plan */}
      <div aria-hidden className={styles.forest}>
        {[28, 40, 32, 48, 36, 24, 44].map((size, index) => (
          // Taille variable par sapin : style inline car calculée en JavaScript.
          <TreePine key={index} className={styles.tree} style={{ width: `${size * 4}px`, height: `${size * 4}px` }} />
        ))}
      </div>

      <div className="relative max-w-lg text-center">
        <p className="font-display text-[7rem] leading-none font-black tracking-tighter text-forest-600 sm:text-[10rem]">
          4<Compass aria-hidden className={styles.compass} />4
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-stone-900">Vous vous êtes perdu·e en forêt…</h1>
        <p className="mt-3 text-stone-600">
          La page que vous cherchez n&apos;existe pas, a été déplacée, ou l&apos;activité a été supprimée.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClasses("primary", "lg")}>
            Retour à l&apos;accueil
          </Link>
          <Link href="/activites" className={buttonClasses("secondary", "lg")}>
            Voir les activités
          </Link>
        </div>
      </div>
    </div>
  );
}
