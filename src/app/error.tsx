"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudLightning } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

/** Page affichée en cas d'erreur inattendue pendant le rendu d'une page. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-amber-50 text-amber-600">
          <CloudLightning aria-hidden className="size-8" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-stone-900">Un orage inattendu…</h1>
        <p className="mt-3 text-stone-600">
          Une erreur est survenue. Réessayez dans un instant ; si le problème persiste, contactez l&apos;accueil du parc.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={retry}>
            Réessayer
          </Button>
          <Link href="/" className={buttonClasses("secondary", "lg")}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
