import type { ReactNode } from "react";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="zt-page">
      <div className="zt-shell">
        <div className="zt-card">{children}</div>
      </div>
    </div>
  );
}
