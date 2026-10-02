import { requireAdmin } from "@/lib/auth";
import { NavLinks } from "@/components/layout/nav-links";

/**
 * Layout de l'espace d'administration.
 * `requireAdmin` protège toutes les pages enfants côté serveur
 * (en plus de la redirection effectuée par le proxy).
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Administration" className="mb-8 overflow-x-auto rounded-2xl bg-white p-1.5 ring-1 ring-stone-200">
        <NavLinks
          items={[
            { href: "/admin", label: "Tableau de bord" },
            { href: "/admin/activites/nouvelle", label: "Nouvelle activité" },
            { href: "/admin/types", label: "Types d'activités" },
          ]}
          exact
        />
      </nav>
      {children}
    </div>
  );
}
