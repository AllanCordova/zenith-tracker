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
