"use server";

import { signIn, signOut } from "@/auth";
import { emailEnabled, googleEnabled } from "@/lib/config";

function safeNext(next: FormDataEntryValue | null) {
  const s = typeof next === "string" ? next : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/albums";
}

export async function signInWithGoogle(formData: FormData) {
  if (!googleEnabled()) return;
  await signIn("google", { redirectTo: safeNext(formData.get("next")) });
}

export async function signInWithEmail(formData: FormData) {
  if (!emailEnabled()) return;
  const email = String(formData.get("email") || "").trim();
  if (!email) return;
  await signIn("resend", { email, redirectTo: safeNext(formData.get("next")) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
