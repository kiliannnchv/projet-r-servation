"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLinks, type NavItem } from "./nav-links";

/** Menu « burger » affiché sur petits écrans. */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="grid size-10 place-items-center rounded-xl text-stone-700 hover:bg-stone-100"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav id="mobile-nav" className="absolute inset-x-0 top-full border-b border-stone-200 bg-white p-4 shadow-lg">
          <NavLinks items={items} vertical onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}
