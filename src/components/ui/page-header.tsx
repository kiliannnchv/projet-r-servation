import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Petit texte au-dessus du titre. */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Boutons alignés à droite. */
  actions?: ReactNode;
};

/** En-tête standard des pages : sur-titre, titre, description et actions. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold tracking-wider text-forest-600 uppercase">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-stone-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
