"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export type NavItem = { href: string; label: string };

/** Indique si un lien correspond à la page courante (ou à l'une de ses sous-pages). */
export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinksProps = {
  items: NavItem[];
  vertical?: boolean;
  /** Ne surligne que la correspondance exacte (pas les sous-pages). */
  exact?: boolean;
  onNavigate?: () => void;
};

/** Liens de navigation, avec mise en évidence de la page courante. */
export function NavLinks({ items, vertical = false, exact = false, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <ul className={clsx("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
      {items.map((item) => {
        const active = exact ? pathname === item.href : isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-forest-50 text-forest-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
