import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="zt-page zt-page-centro">
      <div className="zt-shell">
        <Card>{children}</Card>
      </div>
    </div>
  );
}
