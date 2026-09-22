import { http } from "@/lib/http";

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

const REGISTER_PAYLOAD_REFUSED = "Os dados não passaram";

type Envelope<T> = {
  data?: T;
};

export async function register(input: RegisterInput): Promise<RegisterResult | undefined> {
  const response = await http.post<Envelope<RegisterResult>>("/auth/register", input);
  if (response.status === 400) {
    throw new Error(REGISTER_PAYLOAD_REFUSED);
  }
  return response.data.data;
}

export async function login(input: LoginInput): Promise<LoginResult | undefined> {
  const response = await http.post<Envelope<LoginResult>>("/auth/login", input);
  if (response.status === 401 || response.status === 403) {
    return undefined;
  }
  return response.data.data;
}
