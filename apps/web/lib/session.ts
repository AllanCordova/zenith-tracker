export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TRAINER";
};

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function saveSession(accessToken: string, user: SessionUser): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isAccessTokenExpired(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (padded.length % 4)) % 4;
    const payload = JSON.parse(atob(padded + "=".repeat(pad))) as {
      exp?: number;
    };
    if (typeof payload.exp !== "number") {
      return false;
    }
    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }
  if (isAccessTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as SessionUser;
}

export function areaPathForRole(role: SessionUser["role"]): "/aluno" | "/treinador" {
  return role === "STUDENT" ? "/aluno" : "/treinador";
}
