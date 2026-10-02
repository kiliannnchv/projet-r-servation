import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte gratuitement et réservez vos activités au Parc des Cimes.",
};

export default async function InscriptionPage({ searchParams }: PageProps<"/inscription">) {
  if (await getCurrentUser()) redirect("/activites");

  const { redirect: redirectParam } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;
  const loginHref = redirectTo ? `/connexion?redirect=${encodeURIComponent(redirectTo)}` : "/connexion";

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Quelques secondes suffisent pour rejoindre l'aventure."
      footer={
        <>
          Déjà inscrit·e ?{" "}
          <Link href={loginHref} className="font-semibold text-forest-700 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
