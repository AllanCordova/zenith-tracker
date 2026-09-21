import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="zt-page">
      <div className="zt-shell">
        <Card>{children}</Card>
      </div>
    </div>
  );
}
