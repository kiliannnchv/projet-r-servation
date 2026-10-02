import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";

type AlertTone = "success" | "error" | "info";

const TONES: Record<AlertTone, { box: string; icon: typeof Info }> = {
  success: { box: "border-forest-200 bg-forest-50 text-forest-800", icon: CircleCheck },
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: CircleAlert },
  info: { box: "border-sky-200 bg-sky-50 text-sky-800", icon: Info },
};

/** Encadré de message (succès, erreur, information). */
export function Alert({ tone, children, className }: { tone: AlertTone; children: ReactNode; className?: string }) {
  const { box, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", box, className)}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
