import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/profil/profile-forms";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Gérez vos informations personnelles, votre mot de passe et votre compte.",
};

/** Section de la page profil : titre et description à gauche, contenu à droite. */
function Section({ title, description, children, danger = false }: { title: string; description: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={`grid gap-6 rounded-3xl bg-white p-6 ring-1 sm:p-8 md:grid-cols-[16rem_1fr] ${danger ? "ring-red-200" : "ring-stone-200"}`}>
      <div>
        <h2 className={`font-display text-lg font-semibold ${danger ? "text-red-700" : "text-stone-900"}`}>{title}</h2>
        <p className="mt-1 text-sm text-stone-600">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default async function ProfilPage() {
  const user = await requireUser("/profil");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Mon compte"
        title={`Bonjour ${user.prenom} !`}
        description="Gérez vos informations personnelles et la sécurité de votre compte."
        actions={
          user.role === "admin" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 text-sm font-medium text-forest-700 ring-1 ring-forest-200">
              <ShieldCheck aria-hidden className="size-4" /> Administrateur
            </span>
          )
        }
      />

      <div className="space-y-6">
        <Section title="Informations personnelles" description="Ces informations sont utilisées pour vos réservations.">
          <ProfileForm user={user} />
        </Section>
        <Section title="Mot de passe" description="Choisissez un mot de passe robuste que vous n'utilisez nulle part ailleurs.">
          <PasswordForm />
        </Section>
        <Section danger title="Zone de danger" description="La suppression de votre compte est définitive et entraîne celle de vos réservations.">
          <DeleteAccountForm />
        </Section>
      </div>
    </div>
  );
}
