"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentSubscription } from "@/repositories/billing";

export function useCurrentSubscription(enabled: boolean) {
  return useQuery({
    queryKey: ["billing", "subscription", "current"],
    queryFn: getCurrentSubscription,
    enabled,
  });
}
