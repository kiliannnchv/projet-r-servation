/**
 * Associe à chaque type d'activité une icône et des couleurs.
 * Les types étant créés librement par les administrateurs, on reconnaît
 * quelques mots-clés et on retombe sur une palette cyclique sinon.
 */
import {
  Compass,
  Footprints,
  Mountain,
  Target,
  TreePine,
  Waves,
  Wind,
  Bike,
  type LucideIcon,
} from "lucide-react";

export type TypeVisual = {
  icon: LucideIcon;
  /** Dégradé utilisé en bannière des cartes. */
  gradient: string;
  /** Couleurs du badge. */
  badge: string;
};

const KEYWORD_ICONS: Array<[RegExp, LucideIcon]> = [
  [/accro|arbre|parcours/i, TreePine],
  [/kayak|cano[eë]|rafting|paddle|eau|nage/i, Waves],
  [/escalade|grimpe|via ferrata|montagne/i, Mountain],
  [/arc|tir|paintball/i, Target],
  [/tyrolienne|saut|vol/i, Wind],
  [/rando|marche|balade/i, Footprints],
  [/v[ée]lo|vtt/i, Bike],
];

const PALETTES: Array<Omit<TypeVisual, "icon">> = [
  { gradient: "from-forest-500 to-emerald-700", badge: "bg-forest-50 text-forest-700 ring-forest-200" },
  { gradient: "from-sky-500 to-cyan-700", badge: "bg-sky-50 text-sky-700 ring-sky-200" },
  { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-800 ring-amber-200" },
  { gradient: "from-rose-500 to-pink-700", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
  { gradient: "from-violet-500 to-indigo-700", badge: "bg-violet-50 text-violet-700 ring-violet-200" },
  { gradient: "from-lime-500 to-green-700", badge: "bg-lime-50 text-lime-800 ring-lime-200" },
  { gradient: "from-teal-500 to-cyan-800", badge: "bg-teal-50 text-teal-700 ring-teal-200" },
];

/** Renvoie l'icône et les couleurs d'un type d'activité. */
export function getTypeVisual(type: { id: number; nom: string }): TypeVisual {
  const icon = KEYWORD_ICONS.find(([pattern]) => pattern.test(type.nom))?.[1] ?? Compass;
  return { icon, ...PALETTES[(type.id - 1) % PALETTES.length] };
}
