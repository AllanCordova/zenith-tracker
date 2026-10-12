"use client";

import { useSyncExternalStore } from "react";
import { hasSession, subscribeSession } from "@/lib/session";

export function useHasSession() {
  return useSyncExternalStore(subscribeSession, hasSession, () => false);
}
