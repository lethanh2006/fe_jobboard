import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies, refreshTokenCookieName } from "@/lib/auth-cookies";
import { backendApiUrl } from "@/lib/api-config";
import { isTrustedMutation } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Origin gửi yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  const refreshToken = (await cookies()).get(refreshTokenCookieName)?.value;
  if (refreshToken) {
    await fetch(`${backendApiUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  clearAuthCookies(response);
  return response;
}
