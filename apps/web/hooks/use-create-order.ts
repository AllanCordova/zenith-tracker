"use client";

import { useMutation } from "@tanstack/react-query";
import { createOrder, type PlanCode } from "@/repositories/billing";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (planCode: PlanCode) => createOrder({ planCode }),
  });
}
