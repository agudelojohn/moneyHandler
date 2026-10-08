import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

describe("RootLayout", () => {
  it("renderiza children dentro del body", { timeout: 15_000 }, async () => {
    const { default: RootLayout } = await import("@/app/layout");

    render(
      <RootLayout>
        <main data-testid="child">contenido</main>
      </RootLayout>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("contenido");
  });
});
