"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { FLASH_COOKIE, parseFlash, type FlashMessage } from "@/lib/flash-shared";
import { TOAST_EVENT } from "@/lib/toast";
import clsx from "clsx";

type Toast = FlashMessage & { id: number };

/** Durée d'affichage d'une notification (ms). */
const TOAST_DURATION = 5000;

const STYLES: Record<FlashMessage["type"], { icon: typeof Info; className: string }> = {
  success: { icon: CircleCheck, className: "text-forest-600" },
  error: { icon: CircleAlert, className: "text-red-600" },
  info: { icon: Info, className: "text-sky-600" },
};

/** Lit puis supprime le cookie flash déposé par le serveur. */
function consumeFlashCookie(): FlashMessage | null {
  const raw = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${FLASH_COOKIE}=`))
    ?.slice(FLASH_COOKIE.length + 1);
  if (!raw) return null;
  document.cookie = `${FLASH_COOKIE}=; Max-Age=0; path=/`;
  return parseFlash(raw);
}

/**
 * Affiche les notifications en bas de l'écran. Deux sources :
 *  - le cookie flash (messages posés par le serveur avant une redirection) ;
 *  - les appels à `toast()` côté client.
 *
 * @param flashKey valeur du cookie flash lue par le layout : sa modification
 *                 déclenche une nouvelle lecture (ex. après une redirection du proxy).
 */
export function Toaster({ flashKey }: { flashKey?: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();

  const push = useCallback((flash: FlashMessage) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { ...flash, id }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), TOAST_DURATION);
  }, []);

  // Cookie flash : vérifié à chaque changement de page ou de valeur.
  useEffect(() => {
    const flash = consumeFlashCookie();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation avec un cookie externe
    if (flash) push(flash);
  }, [pathname, flashKey, push]);

  // Notifications émises côté client.
  useEffect(() => {
    const handler = (event: Event) => push((event as CustomEvent<FlashMessage>).detail);
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [push]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      {toasts.map((t) => {
        const { icon: Icon, className } = STYLES[t.type];
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-stone-900/10"
          >
            <Icon aria-hidden className={clsx("mt-0.5 size-5 shrink-0", className)} />
            <p className="flex-1 text-sm text-stone-800">{t.message}</p>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((x) => x.id !== t.id))}
              className="rounded-md p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              aria-label="Fermer la notification"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
