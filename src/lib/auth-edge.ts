import { jwtVerify, SignJWT, type JWTPayload } from 'jose';

/**
 * Partie « bord » de l'authentification : uniquement jose, aucune dépendance
 * Node (ni bcrypt, ni Prisma). C'est ce que le middleware peut exécuter.
 * Le reste vit dans src/lib/auth.ts.
 */

export const COOKIE_SESSION = 'mb_session';
const DUREE_SESSION = '7d';

export type SessionAdmin = {
  id: number;
  email: string;
  name: string;
};

function cleSecrete(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'AUTH_SECRET est absent ou trop court. Renseigner une valeur d’au moins 16 caractères dans .env (openssl rand -base64 32).',
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signerSession(admin: SessionAdmin): Promise<string> {
  return new SignJWT({ ...admin } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(DUREE_SESSION)
    .sign(cleSecrete());
}

export async function verifierSession(token: string | undefined): Promise<SessionAdmin | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, cleSecrete());
    if (typeof payload.id !== 'number' || typeof payload.email !== 'string') return null;
    return {
      id: payload.id,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : 'Administrateur',
    };
  } catch {
    return null;
  }
}
