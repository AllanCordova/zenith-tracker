"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";

export default function TreinadorPage() {
  const router = useRouter();
  const token = getAccessToken();
  const user = getSessionUser();
  const role = user?.role;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (role === "STUDENT") {
      router.push(areaPathForRole(role));
    }
  }, [token, role, router]);

  if (!token || role === "STUDENT") {
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
