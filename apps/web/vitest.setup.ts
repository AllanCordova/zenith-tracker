import { setImmediate } from "node:timers";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(async () => {
  cleanup();
  // O React 19 lê `window.event` num setImmediate. Se o jsdom cair antes, o
  // Vitest fecha com erro mesmo quando todos os testes passaram.
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
  }
});
