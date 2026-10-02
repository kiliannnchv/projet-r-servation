import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import type { ActiviteDetail } from "@/data/activites";
import { formatDuration, formatMonth, formatTime } from "@/lib/format";
import clsx from "clsx";
import { CapacityBar } from "./capacity-bar";
import { TypeBadge } from "./type-badge";
import { getTypeVisual } from "./type-visual";

type ActiviteCardProps = {
  activite: ActiviteDetail;
  /** L'utilisateur connecté a déjà réservé cette activité. */
  reserved?: boolean;
};

/** Carte de présentation d'une activité, cliquable vers sa page de détail. */
export function ActiviteCard({ activite, reserved = false }: ActiviteCardProps) {
  const { icon: Icon, gradient } = getTypeVisual(activite.type);
  const full = activite.placesRestantes === 0;

  return (
    <Link
      href={`/activites/${activite.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
    >
      {/* Bannière colorée selon le type */}
      <div className={clsx("relative h-28 bg-linear-to-br", gradient)}>
        <Icon aria-hidden className="absolute -right-3 -bottom-4 size-28 text-white/20 transition group-hover:scale-105" />
        <div className="absolute top-3 left-3 rounded-2xl bg-white/95 px-3 py-1.5 text-center shadow-sm">
          <p className="text-[0.65rem] font-semibold tracking-wide text-stone-500 uppercase">
            {formatMonth(activite.datetimeDebut)}
          </p>
          <p className="font-display text-xl leading-none font-bold text-stone-900">
            {activite.datetimeDebut.getDate()}
          </p>
        </div>
        {(reserved || full) && (
          <span
            className={clsx(
              "absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
              reserved ? "bg-white text-forest-700" : "bg-stone-900/80 text-white",
            )}
          >
            {reserved ? "✓ Réservé" : "Complet"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <TypeBadge type={activite.type} className="self-start" />
        <h3 className="mt-3 font-display text-lg leading-snug font-semibold text-stone-900 group-hover:text-forest-700">
          {activite.nom}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-stone-600">{activite.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-stone-400" />
            {formatTime(activite.datetimeDebut)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-stone-400" />
            {formatDuration(activite.duree)}
          </span>
        </div>

        <CapacityBar
          className="mt-auto pt-5"
          placesRestantes={activite.placesRestantes}
          placesDisponibles={activite.placesDisponibles}
        />
      </div>
    </Link>
  );
}
