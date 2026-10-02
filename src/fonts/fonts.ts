/**
 * Polices de l'application, optimisées par `next/font` : elles sont
 * téléchargées au build et servies avec les autres fichiers du site
 * (aucun appel à Google Fonts au chargement de la page).
 *
 * L'option `variable` crée une variable CSS, utilisée dans `globals.css`
 * (`--font-sans` et `--font-display`).
 */
import { Inter, Outfit } from "next/font/google";

/** Police du texte courant. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/** Police des titres. */
export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});
