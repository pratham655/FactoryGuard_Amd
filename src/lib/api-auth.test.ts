import { beforeEach, describe, expect, it, vi } from "vitest";

const clerkMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: clerkMocks.auth,
  currentUser: clerkMocks.currentUser,
}));

import { requireFactoryGuardRole } from "./api-auth";

describe("requireFactoryGuardRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no user is signed in", async () => {
    clerkMocks.auth.mockResolvedValue({ userId: null });

    const result = await requireFactoryGuardRole();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
    }
    expect(clerkMocks.currentUser).not.toHaveBeenCalled();
  });

  it("returns 401 when Clerk user data does not match the session", async () => {
    clerkMocks.auth.mockResolvedValue({ userId: "session-user" });
    clerkMocks.currentUser.mockResolvedValue({
      id: "different-user",
      publicMetadata: { role: "employee" },
    });

    const result = await requireFactoryGuardRole();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
    }
  });

  it("returns 403 when the signed-in user has no permitted role", async () => {
    clerkMocks.auth.mockResolvedValue({ userId: "user-1" });
    clerkMocks.currentUser.mockResolvedValue({
      id: "user-1",
      publicMetadata: {},
    });

    const result = await requireFactoryGuardRole();

    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(403);
    }
  });

  it("returns verified identity for an employee", async () => {
    clerkMocks.auth.mockResolvedValue({ userId: "user-1" });
    clerkMocks.currentUser.mockResolvedValue({
      id: "user-1",
      fullName: "Factory Operator",
      primaryEmailAddress: { emailAddress: "operator@example.com" },
      publicMetadata: { role: "employee" },
    });

    const result = await requireFactoryGuardRole();

    expect(result).toEqual({
      authorized: true,
      identity: {
        userId: "user-1",
        operator: "Factory Operator",
        role: "employee",
      },
    });
  });
});
