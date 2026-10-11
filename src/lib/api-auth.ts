import { NextResponse } from "next/server";

export type FactoryGuardIdentity = {
  userId: string;
  operator: string;
  role: "owner" | "employee";
};

type AuthorizationResult =
  | { authorized: true; identity: FactoryGuardIdentity }
  | { authorized: false; response: NextResponse };

/**
 * Demo-only identity for the public hackathon showcase.
 *
 * This intentionally does not provide real authentication or authorization.
 * Do not use this mode for production systems connected to real equipment or
 * sensitive data. Restore a real identity provider before production use.
 */
export async function requireFactoryGuardRole(): Promise<AuthorizationResult> {
  return {
    authorized: true,
    identity: {
      userId: "demo-operator",
      operator: "Demo Operator",
      role: "owner",
    },
  };
}
