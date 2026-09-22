"use client";

import { useMutation } from "@tanstack/react-query";
import { login, type LoginInput } from "@/repositories/auth";
import { saveSession } from "@/lib/session";

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess(result) {
      if (result?.accessToken && result.user) {
        saveSession(result.accessToken, result.user);
      }
    },
  });
}
