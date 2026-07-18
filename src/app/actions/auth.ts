"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return {
      error: "Serverkonfiguration fehlt (APP_PASSWORD ist nicht gesetzt).",
    };
  }

  if (!password || !safeCompare(password, appPassword)) {
    return { error: "Falsches Passwort." };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
