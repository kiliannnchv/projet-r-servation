import clsx from "clsx";
import { plural } from "@/lib/format";

type CapacityBarProps = {
  placesRestantes: number;
  placesDisponibles: number;
  className?: string;
};

/** Jauge de remplissage d'une activité, colorée selon les places restantes. */
export function CapacityBar({ placesRestantes, placesDisponibles, className }: CapacityBarProps) {
  const ratio = placesDisponibles > 0 ? (placesDisponibles - placesRestantes) / placesDisponibles : 1;
  const full = placesRestantes === 0;
  const almostFull = !full && ratio >= 0.75;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span
          className={clsx(
            "font-semibold",
            full ? "text-red-600" : almostFull ? "text-amber-700" : "text-forest-700",
          )}
        >
          {full ? "Complet" : `${plural(placesRestantes, "place restante", "places restantes")}`}
        </span>
        <span className="text-stone-500">sur {placesDisponibles}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-label="Taux de remplissage"
        aria-valuemin={0}
        aria-valuemax={placesDisponibles}
        aria-valuenow={placesDisponibles - placesRestantes}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            full ? "bg-red-500" : almostFull ? "bg-amber-500" : "bg-forest-500",
          )}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
