import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import {
  COOKIE_SESSION,
  signerSession,
  verifierSession,
  type SessionAdmin,
} from '@/lib/auth-edge';

export { COOKIE_SESSION, type SessionAdmin };

const COUT_BCRYPT = 10;
const DUREE_COOKIE = 60 * 60 * 24 * 7; // 7 jours

export function hacherMotDePasse(motDePasse: string): string {
  return bcrypt.hashSync(motDePasse, COUT_BCRYPT);
}

export function verifierMotDePasse(motDePasse: string, hash: string): boolean {
  return bcrypt.compareSync(motDePasse, hash);
}

/** Vérifie les identifiants et pose le cookie de session. */
export async function connecter(
  email: string,
  motDePasse: string,
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // Message volontairement identique dans les deux cas : on n'indique pas si
  // l'adresse existe.
  const echec = { ok: false as const, erreur: 'Identifiants incorrects.' };
  if (!admin) return echec;
  if (!verifierMotDePasse(motDePasse, admin.passwordHash)) return echec;

  const token = await signerSession({ id: admin.id, email: admin.email, name: admin.name });
  cookies().set(COOKIE_SESSION, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DUREE_COOKIE,
  });
  return { ok: true };
}

export function deconnecter(): void {
  cookies().delete(COOKIE_SESSION);
}

/** Session courante, ou null. */
export async function getSession(): Promise<SessionAdmin | null> {
  return verifierSession(cookies().get(COOKIE_SESSION)?.value);
}

/**
 * À appeler au début de toute page ou action d'administration : le middleware
 * filtre déjà les URL, cette vérification protège les Server Actions elles-mêmes.
 */
export async function exigerSession(): Promise<SessionAdmin> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
