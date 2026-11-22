"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentOrder } from "@/repositories/billing";

export function useCurrentOrder(enabled: boolean) {
  return useQuery({
    queryKey: ["billing", "orders", "current"],
    queryFn: getCurrentOrder,
    enabled,
  });
}
