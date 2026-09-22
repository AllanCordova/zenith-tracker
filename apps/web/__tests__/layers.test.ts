import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sourceOf(relativePath: string) {
  return readFileSync(resolve(webRoot, relativePath), "utf8");
}

test("páginas de entrada não importam axios, o cliente HTTP nem o repositório", () => {
  for (const file of ["app/login/page.tsx", "app/cadastro/page.tsx"]) {
    const source = sourceOf(file);
    expect(source).not.toMatch(/from ["']axios["']/);
    expect(source).not.toMatch(/from ["']@\/lib\/http["']/);
    expect(source).not.toMatch(/from ["']@\/repositories\//);
  }
});

test("componentes de UI não importam axios nem React Query", () => {
  for (const file of [
    "components/ui/button.tsx",
    "components/ui/input.tsx",
    "components/ui/select.tsx",
    "components/ui/card.tsx",
    "components/ui/role-select.tsx",
    "components/layout/header.tsx",
    "components/layout/footer.tsx",
    "components/layout/theme-toggle.tsx",
  ]) {
    const source = sourceOf(file);
    expect(source).not.toMatch(/from ["']axios["']/);
    expect(source).not.toMatch(/from ["']@tanstack\/react-query["']/);
    expect(source).not.toMatch(/from ["']@\/lib\/http["']/);
  }
});
