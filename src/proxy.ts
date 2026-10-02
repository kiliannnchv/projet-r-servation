/**
 * Proxy (ex-middleware, fichier `proxy.ts` depuis Next.js 16) : redirections
 * « optimistes » basées sur le cookie de session.
 *
 * Il évite d'afficher une page protégée à un visiteur non connecté, mais ne
 * remplace pas les vérifications serveur faites dans les pages et les actions
 * (voir `src/lib/auth.ts`), qui relisent l'utilisateur en base.
 */
import { NextResponse, type NextRequest } from "next/server";
import { checkAuth } from "@/utils/sessions";
import { FLASH_COOKIE, type FlashMessage } from "@/lib/flash-shared";

/** Pages nécessitant d'être connecté. */
const PROTECTED_PREFIXES = ["/profil", "/reservations", "/admin"];
/** Pages réservées aux administrateurs. */
const ADMIN_PREFIXES = ["/admin"];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Redirige en déposant un message flash affiché sur la page d'arrivée. */
function redirectWithFlash(url: URL, flash: FlashMessage): NextResponse {
  const response = NextResponse.redirect(url);
  response.cookies.set(FLASH_COOKIE, JSON.stringify(flash), {
    path: "/",
    maxAge: 60,
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Session valide (JWT signé et non expiré) ou null.
  const session = await checkAuth(request);

  if (!session && matches(pathname, PROTECTED_PREFIXES)) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("redirect", pathname + search);
    return redirectWithFlash(url, { type: "info", message: "Connectez-vous pour accéder à cette page." });
  }

  if (session && session.role !== "admin" && matches(pathname, ADMIN_PREFIXES)) {
    return redirectWithFlash(new URL("/", request.url), {
      type: "error",
      message: "Accès refusé : cette page est réservée aux administrateurs.",
    });
  }

  return NextResponse.next();
}

export const config = {
  // On ignore les fichiers statiques et les ressources internes de Next.js.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
