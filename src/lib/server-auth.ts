import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApiUrl } from "@/lib/api-config";
import type { AuthUser, UserRole } from "@/types/auth";

export const authCookieName = "jobboard_access_token";

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export async function getSession(): Promise<AuthSession | null> {
  const accessToken = (await cookies()).get(authCookieName)?.value;
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${backendApiUrl}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return {
      accessToken,
      user: (await response.json()) as AuthUser,
    };
  } catch {
    return null;
  }
}

export async function requireRole(
  role: UserRole,
  returnPath: string,
): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect(`/dang-nhap?redirect=${encodeURIComponent(returnPath)}`);
  }

  if (session.user.role !== role) {
    redirect(session.user.role === "Employer" ? "/nha-tuyen-dung" : "/viec-lam");
  }

  return session;
}
