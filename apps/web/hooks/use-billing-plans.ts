"use client";

import { useQuery } from "@tanstack/react-query";
import { listPlans } from "@/repositories/billing";

export function useBillingPlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: listPlans,
  });
}
