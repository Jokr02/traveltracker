"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export type LoginState = { error?: string } | undefined;

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const CLEANUP_AFTER_HOURS = 24;

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recentFailures = await prisma.loginAttempt.count({
    where: { ip, createdAt: { gte: windowStart } },
  });

  if (recentFailures >= MAX_ATTEMPTS) {
    return {
      error: `Zu viele Fehlversuche. Bitte in ${WINDOW_MINUTES} Minuten erneut versuchen.`,
    };
  }

  const password = String(formData.get("password") ?? "");
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return {
      error: "Serverkonfiguration fehlt (APP_PASSWORD ist nicht gesetzt).",
    };
  }

  if (!password || !safeCompare(password, appPassword)) {
    await prisma.loginAttempt.create({ data: { ip } });

    // Opportunistisches Aufräumen alter Einträge, damit es keinen Cronjob braucht.
    const cleanupBefore = new Date(
      Date.now() - CLEANUP_AFTER_HOURS * 60 * 60 * 1000,
    );
    await prisma.loginAttempt
      .deleteMany({ where: { createdAt: { lt: cleanupBefore } } })
      .catch(() => {});

    const remaining = MAX_ATTEMPTS - recentFailures - 1;
    return {
      error:
        remaining > 0
          ? `Falsches Passwort. Noch ${remaining} Versuch(e) übrig.`
          : `Falsches Passwort. Zu viele Fehlversuche — bitte in ${WINDOW_MINUTES} Minuten erneut versuchen.`,
    };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
