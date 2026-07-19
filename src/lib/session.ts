import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { authenticated: true; demo: boolean };

export async function encryptSession(opts?: { demo?: boolean }): Promise<string> {
  return new SignJWT({ authenticated: true, demo: Boolean(opts?.demo) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (payload.authenticated !== true) return null;
    return { authenticated: true, demo: payload.demo === true };
  } catch {
    return null;
  }
}

export async function createSession(opts?: { demo?: boolean }) {
  const token = await encryptSession(opts);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Ob die aktuelle Session eine Demo-Session ist (eigene, isolierte Demo-DB
 * statt der echten Daten — siehe src/lib/db.ts). */
export async function isDemoMode(): Promise<boolean> {
  const session = await getSession();
  return session?.demo === true;
}

/** Defense-in-depth check for Server Actions/Route Handlers (Proxy already guards pages optimistically). */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export { SESSION_COOKIE };
