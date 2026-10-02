import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, type NavItem } from "./nav-links";
import { UserMenu } from "./user-menu";

/** En-tête du site : logo, navigation et accès au compte. */
export async function Header() {
  const user = await getCurrentUser();

  // Les liens affichés dépendent du statut de l'utilisateur.
  const items: NavItem[] = [
    { href: "/", label: "Accueil" },
    { href: "/activites", label: "Activités" },
    ...(user ? [{ href: "/reservations", label: "Mes réservations" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Administration" }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Navigation principale" className="hidden md:block">
            <NavLinks items={items} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link href="/connexion" className={buttonClasses("ghost", "sm")}>
                Connexion
              </Link>
              <Link href="/inscription" className={buttonClasses("primary", "sm")}>
                Inscription
              </Link>
            </>
          )}
          <MobileMenu items={items} />
        </div>
      </div>
    </header>
  );
}
