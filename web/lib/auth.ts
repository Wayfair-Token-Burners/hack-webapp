import { cookies } from "next/headers";

export const SESSION_COOKIE = "fd_user";

export type Session = {
  name: string;
  email: string;
  employeeId: string;
  plant: string;
  role: string;
  signedInAt: string;
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.name || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "Employee";
  return (
    local
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part[0]!.toUpperCase() + part.slice(1))
      .join(" ") || "Employee"
  );
}
