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

export async function encryptSession(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(getSecretKey());
}

export async function decryptSession(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function createSession() {
  const token = await encryptSession();
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

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Defense-in-depth check for Server Actions/Route Handlers (Proxy already guards pages optimistically). */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export { SESSION_COOKIE };
