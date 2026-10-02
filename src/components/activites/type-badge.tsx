import type { TypeActivite } from "@/types/models";
import clsx from "clsx";
import { getTypeVisual } from "./type-visual";

/** Pastille indiquant le type d'une activité. */
export function TypeBadge({ type, className }: { type: TypeActivite; className?: string }) {
  const { icon: Icon, badge } = getTypeVisual(type);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        badge,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {type.nom}
    </span>
  );
}
