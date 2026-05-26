"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, nameFromEmail, type Session } from "./auth";

const EIGHT_HOURS = 60 * 60 * 8;

export async function signInAction(formData: FormData) {
  const emailRaw = String(formData.get("email") ?? "").trim();

  const email = emailRaw || "maria.chen@plant14.freightdesk.example";
  const name = nameFromEmail(email);

  const session: Session = {
    name,
    email,
    employeeId: `EMP-${Math.floor(10000 + Math.random() * 89999)}`,
    plant: "Plant 14 · Hickory NC",
    role: "Buyer · Tier 2",
    signedInAt: new Date().toISOString(),
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: EIGHT_HOURS,
  });

  redirect("/");
}

export async function signOutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/signin");
}
