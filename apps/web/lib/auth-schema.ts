import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Informe o nome"),
    email: z.email("Informe um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha precisa de pelo menos 8 caracteres")
      .regex(/[A-Za-z]/, "A senha precisa de letra")
      .regex(/\d/, "A senha precisa de número"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "TRAINER"]),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
