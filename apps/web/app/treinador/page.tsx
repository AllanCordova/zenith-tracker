"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getSessionUser } from "@/lib/session";

export default function TreinadorPage() {
  const router = useRouter();
  const user = getSessionUser();
  const role = user?.role;

  useEffect(() => {
    if (role === "STUDENT") {
      router.push(areaPathForRole(role));
    }
  }, [role, router]);

  if (role === "STUDENT") {
    return null;
  }

  return (
    <main>
      <p>{user?.name ?? ""}</p>
      {/* TODO #US05: carteira ainda não libera até existir Issue da US05 */}
      <p>carteira ainda não libera</p>
    </main>
  );
}
