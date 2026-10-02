/**
 * Hachage et vérification des mots de passe avec bcrypt.
 *
 * Ces fonctions sont appelées côté serveur (dans les routes API) : le mot de
 * passe en clair n'est jamais stocké, et le serveur peut vérifier ses règles
 * de robustesse avant de le hacher. Le transport est protégé par HTTPS.
 */
import "server-only";
import bcrypt from "bcryptjs";

/** Coût du hachage (10 = bon compromis sécurité / rapidité). */
const SALT_ROUNDS = 10;

/** Hache un mot de passe en clair. */
export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/** Compare un mot de passe saisi avec le hash stocké en base. */
export function checkPassword(userPassword: string, dbPassword: string): Promise<boolean> {
  return bcrypt.compare(userPassword, dbPassword);
}
