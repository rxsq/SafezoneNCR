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

export async function getMe(): Promise<Me | null> {
  try {
    const me = await api<Me>("/api/auth/me");
    return me || null;
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
