import "server-only";

import type { NextResponse } from "next/server";
import type { LoginResponse } from "@/types/auth";

export const accessTokenCookieName = "jobboard_access_token";
export const refreshTokenCookieName = "jobboard_refresh_token";
export const rememberSessionCookieName = "jobboard_remember_session";

const commonCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setAuthCookies(
  response: NextResponse,
  login: LoginResponse,
  remember: boolean,
) {
  response.cookies.set(accessTokenCookieName, login.accessToken, {
    ...commonCookieOptions,
    ...(remember ? { expires: new Date(login.expiresAt) } : {}),
  });
  response.cookies.set(refreshTokenCookieName, login.refreshToken, {
    ...commonCookieOptions,
    ...(remember ? { expires: new Date(login.refreshExpiresAt) } : {}),
  });

  if (remember) {
    response.cookies.set(rememberSessionCookieName, "1", {
      ...commonCookieOptions,
      expires: new Date(login.refreshExpiresAt),
    });
  } else {
    response.cookies.delete(rememberSessionCookieName);
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(accessTokenCookieName);
  response.cookies.delete(refreshTokenCookieName);
  response.cookies.delete(rememberSessionCookieName);
}
