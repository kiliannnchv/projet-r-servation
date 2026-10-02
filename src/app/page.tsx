import Link from "next/link";
import { ArrowRight, CalendarCheck, ShieldCheck, Sparkles, TreePine } from "lucide-react";
import { listActivites, listTypes } from "@/data/activites";
import { getCurrentUser } from "@/lib/auth";
import { ActiviteCard } from "@/components/activites/activite-card";
import { getTypeVisual } from "@/components/activites/type-visual";
import { buttonClasses } from "@/components/ui/button";

/** Nombre d'activités mises en avant sur l'accueil. */
const FEATURED_COUNT = 3;

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Réservation en 2 clics",
    text: "Choisissez votre créneau, réservez : votre place est garantie instantanément.",
  },
  {
    icon: ShieldCheck,
    title: "Encadrement certifié",
    text: "Tous nos moniteurs sont diplômés d'État et le matériel est contrôlé chaque jour.",
  },
  {
    icon: Sparkles,
    title: "Pour tous les niveaux",
    text: "Des parcours pour les enfants dès 4 ans comme pour les aventuriers aguerris.",
  },
];

export default async function HomePage() {
  const [user, activites, types] = await Promise.all([getCurrentUser(), listActivites(), listTypes()]);
  const featured = activites.slice(0, FEATURED_COUNT);

  return (
    <>
      {/* Bandeau d'accueil */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-forest-600),transparent_60%),radial-gradient(ellipse_at_bottom_left,var(--color-forest-800),transparent_55%)]"
        />
        <TreePine aria-hidden className="absolute -right-10 -bottom-16 size-96 text-white/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
            <span className="size-1.5 rounded-full bg-forest-300" /> {activites.length} sessions à venir
          </p>
          <h1 className="max-w-2xl font-display text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            L&apos;aventure grandeur nature commence ici.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-forest-100/90">
            Accrobranche, kayak, escalade, tyrolienne… Réservez vos activités au cœur de la forêt en quelques
            secondes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/activites" className={buttonClasses("secondary", "lg")}>
              Voir les activités <ArrowRight aria-hidden className="size-4" />
            </Link>
            {!user && (
              <Link
                href="/inscription"
                className="inline-flex h-12 items-center rounded-xl px-6 font-medium text-white ring-1 ring-white/30 transition hover:bg-white/10"
              >
                Créer un compte
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
        {/* Types d'activités */}
        {types.length > 0 && (
          <section aria-labelledby="types-title">
            <h2 id="types-title" className="font-display text-2xl font-bold text-stone-900">
              Nos univers
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {types.map((type) => {
                const { icon: Icon, gradient } = getTypeVisual(type);
                return (
                  <Link
                    key={type.id}
                    href={`/activites?type=${type.id}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-5 text-center transition hover:border-forest-300 hover:shadow-md"
                  >
                    <span className={`grid size-12 place-items-center rounded-2xl bg-linear-to-br ${gradient} text-white shadow-sm transition group-hover:scale-105`}>
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <span className="text-sm font-medium text-stone-800">{type.nom}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Prochaines activités */}
        <section aria-labelledby="next-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="next-title" className="font-display text-2xl font-bold text-stone-900">
                Prochaines sessions
              </h2>
              <p className="mt-1 text-stone-600">Les places partent vite : ne tardez pas !</p>
            </div>
            <Link href="/activites" className="hidden items-center gap-1 text-sm font-medium text-forest-700 hover:text-forest-800 sm:inline-flex">
              Tout voir <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((activite) => (
                <ActiviteCard key={activite.id} activite={activite} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-stone-600">Aucune session n&apos;est programmée pour le moment.</p>
          )}
        </section>

        {/* Points forts */}
        <section aria-label="Pourquoi nous choisir" className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">
              <Icon aria-hidden className="size-8 text-forest-600" />
              <h3 className="mt-4 font-display text-lg font-semibold text-stone-900">{title}</h3>
              <p className="mt-1 text-sm text-stone-600">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
