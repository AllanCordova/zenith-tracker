export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TRAINER";
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TRAINER";
};

export type RegisterResult = {
  accessToken: string;
  user: PublicUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = RegisterResult;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const REGISTER_PAYLOAD_REFUSED = "Os dados não passaram";

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const envelope = (await response.json()) as { data: RegisterResult };
  if (response.status === 400) {
    throw new Error(REGISTER_PAYLOAD_REFUSED);
  }
  return envelope.data;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const envelope = (await response.json()) as { data: LoginResult };
  return envelope.data;
}
