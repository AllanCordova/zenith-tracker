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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const envelope = (await response.json()) as { data: RegisterResult };
  return envelope.data;
}
