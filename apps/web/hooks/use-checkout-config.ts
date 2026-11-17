"use client";

import { useQuery } from "@tanstack/react-query";
import { getCheckoutConfig } from "@/repositories/billing";

export function useCheckoutConfig(enabled: boolean) {
  return useQuery({
    queryKey: ["billing", "checkout-config"],
    queryFn: getCheckoutConfig,
    enabled,
  });
}
