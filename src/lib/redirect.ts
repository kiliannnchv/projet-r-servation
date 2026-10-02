/**
 * N'accepte que les redirections internes (« /reservations ») afin d'éviter
 * les redirections ouvertes vers un site externe (« //site-malveillant.com »).
 */
export function safeRedirect(target: string | undefined | null, fallback: string): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return fallback;
  return target;
}
