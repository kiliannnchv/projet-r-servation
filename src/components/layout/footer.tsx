import { SITE_NAME } from "./logo";

/** Pied de page. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {SITE_NAME} — Parc d&apos;activités de plein air
        </p>
        <p>Ouvert tous les jours, de 9 h à 20 h</p>
      </div>
    </footer>
  );
}
