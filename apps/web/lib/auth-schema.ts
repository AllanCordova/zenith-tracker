import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    name: z.string().min(1),
    email: z.email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Za-z]/)
      .regex(/\d/),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "TRAINER"]),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
