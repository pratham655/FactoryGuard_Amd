import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export type FactoryGuardIdentity = {
  userId: string;
  operator: string;
  role: "owner" | "employee";
};

type AuthorizationResult =
  | { authorized: true; identity: FactoryGuardIdentity }
  | { authorized: false; response: NextResponse };

export async function requireFactoryGuardRole(): Promise<AuthorizationResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  const user = await currentUser();

  if (!user || user.id !== userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unable to verify signed-in user" },
        { status: 401 },
      ),
    };
  }

  const role = user.publicMetadata?.role;

  if (role !== "owner" && role !== "employee") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Your account has no FactoryGuard role. Ask the owner to assign owner or employee access." },
        { status: 403 },
      ),
    };
  }

  return {
    authorized: true,
    identity: {
      userId,
      operator: user.fullName?.trim() || user.primaryEmailAddress?.emailAddress || userId,
      role,
    },
  };
}
