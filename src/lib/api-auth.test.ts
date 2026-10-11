import { describe, expect, it } from "vitest";
import { requireFactoryGuardRole } from "./api-auth";

describe("requireFactoryGuardRole demo mode", () => {
  it("returns a consistent demo operator identity without Clerk", async () => {
    await expect(requireFactoryGuardRole()).resolves.toEqual({
      authorized: true,
      identity: {
        userId: "demo-operator",
        operator: "Demo Operator",
        role: "owner",
      },
    });
  });
});
