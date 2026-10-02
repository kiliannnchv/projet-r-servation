"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { callApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { PublicUser } from "@/types/models";

/** Initiales affichées dans l'avatar. */
const initials = (user: Pick<PublicUser, "prenom" | "nom">) =>
  `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();

/** Menu déroulant du compte (profil, réservations, administration, déconnexion). */
export function UserMenu({ user }: { user: PublicUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /** Déconnexion : POST /api/logout supprime le cookie, puis retour à l'accueil. */
  const handleLogout = async () => {
    setOpen(false);
    const result = await callApi("/api/logout", "POST");
    if (!result.ok) {
      toast("error", result.message);
      return;
    }
    if (result.message) toast("info", result.message);
    router.push("/");
    router.refresh(); // Met à jour l'en-tête
  };

  // Fermeture au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-stone-100"
      >
        <span className="grid size-8 place-items-center rounded-full bg-forest-100 text-xs font-bold text-forest-800">
          {initials(user)}
        </span>
        <span className="hidden text-sm font-medium text-stone-800 sm:inline">{user.prenom}</span>
        <ChevronDown aria-hidden className="size-4 text-stone-500" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/10"
        >
          <div className="border-b border-stone-100 px-3 pt-2 pb-3">
            <p className="truncate text-sm font-semibold text-stone-900">
              {user.prenom} {user.nom}
            </p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
          </div>
          <div className="py-1" onClick={() => setOpen(false)}>
            <Link href="/profil" role="menuitem" className={itemClass}>
              <UserRound aria-hidden className="size-4" /> Mon profil
            </Link>
            <Link href="/reservations" role="menuitem" className={itemClass}>
              <Ticket aria-hidden className="size-4" /> Mes réservations
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" role="menuitem" className={itemClass}>
                <ShieldCheck aria-hidden className="size-4" /> Administration
              </Link>
            )}
          </div>
          <div className="border-t border-stone-100 pt-1">
            <button type="button" role="menuitem" onClick={handleLogout} className={`${itemClass} text-red-700 hover:bg-red-50 hover:text-red-800`}>
              <LogOut aria-hidden className="size-4" /> Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
