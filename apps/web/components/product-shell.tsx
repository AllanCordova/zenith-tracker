import type { ReactNode } from "react";

export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="zt-page zt-page-area">
      <div className="zt-shell-area">{children}</div>
    </div>
  );
}
