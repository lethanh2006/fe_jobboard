import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { accessTokenCookieName, refreshTokenCookieName } from "@/lib/auth-cookies";
import { backendApiUrl } from "@/lib/api-config";
import type { AuthUser, UserRole } from "@/types/auth";

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export async function getSession(): Promise<AuthSession | null> {
  const accessToken = (await cookies()).get(accessTokenCookieName)?.value;
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
  const session = await requireSession(returnPath);

  if (session.user.role !== role) {
    redirect(session.user.role === "Employer" ? "/nha-tuyen-dung" : "/viec-lam");
  }

  return session;
}

export async function requireSession(returnPath: string): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    if ((await cookies()).has(refreshTokenCookieName)) {
      redirect(`/api/auth/refresh?redirect=${encodeURIComponent(returnPath)}`);
    }

    redirect(`/dang-nhap?redirect=${encodeURIComponent(returnPath)}`);
  }

  return session;
}
