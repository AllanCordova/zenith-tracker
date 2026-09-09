import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

vi.mock("next/image", () => ({
  default: function Image({
    alt,
    src,
  }: {
    alt: string;
    src: string;
  }) {
    // The mock is a test double, not a production image.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} />;
  },
}));

test("home page renders a heading", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
});
