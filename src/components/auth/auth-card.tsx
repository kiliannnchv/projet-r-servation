import type { ReactNode } from "react";
import { TreePine } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

/** Mise en page commune aux pages de connexion et d'inscription. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--color-forest-100),transparent_60%)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-forest-600 text-white shadow-md">
            <TreePine aria-hidden className="size-6" />
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">{title}</h1>
          <p className="mt-2 text-stone-600">{subtitle}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-200 sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-stone-600">{footer}</p>
      </div>
    </div>
  );
}
