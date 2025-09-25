import { api } from "./api";

export type Me = {
  empID: number;
  empFirst: string;
  empLast: string;
  empEmail: string;
  empUsername: string;
  posID: number;
  Position?: { posDescription: string };
};

type MeResponse = { user: Me };

export async function getMe(): Promise<Me | null> {
  try {
    const res = await api<MeResponse>("/api/auth/me");
    return res?.user ?? null;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string) {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return api("/api/auth/logout", { method: "POST" });
}
