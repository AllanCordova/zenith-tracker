"use client";

import { useMutation } from "@tanstack/react-query";
import { register, type RegisterInput } from "@/repositories/auth";
import { saveSession } from "@/lib/session";

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess(result) {
      if (result?.accessToken && result.user) {
        saveSession(result.accessToken, result.user);
      }
    },
  });
}
