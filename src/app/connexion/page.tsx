import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte pour réserver vos activités.",
};

export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  // Un utilisateur déjà connecté n'a rien à faire ici.
  if (await getCurrentUser()) redirect("/activites");

  const { redirect: redirectParam } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;
  const registerHref = redirectTo ? `/inscription?redirect=${encodeURIComponent(redirectTo)}` : "/inscription";

  return (
    <AuthCard
      title="Bon retour !"
      subtitle="Connectez-vous pour réserver vos prochaines aventures."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href={registerHref} className="font-semibold text-forest-700 hover:underline">
            Inscrivez-vous gratuitement
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
