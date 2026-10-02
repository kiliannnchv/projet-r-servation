import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

/** Bloc affiché lorsqu'une liste est vide. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-forest-50 text-forest-600">
        <Icon aria-hidden className="size-7" />
      </div>
      <h2 className="font-display text-lg font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-stone-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
