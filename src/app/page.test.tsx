import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user" }),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      fullName: "Test Operator",
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  }),
  UserButton: () => null,
}));

import Home from "./page";

describe("FactoryGuard dashboard", () => {
  it("renders the FactoryGuard heading", async () => {
    const html = renderToStaticMarkup(await Home());
    expect(html).toContain("FactoryGuard");
  });

  it("renders the factory status section", async () => {
    const html = renderToStaticMarkup(await Home());
    expect(html).toContain("Factory Status");
  });

  it("renders the machine monitoring section", async () => {
    const html = renderToStaticMarkup(await Home());
    expect(html).toContain("Machine Monitoring");
  });
});
