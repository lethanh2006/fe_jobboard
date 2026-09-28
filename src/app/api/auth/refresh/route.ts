import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  rememberSessionCookieName,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { refreshSession } from "@/lib/refresh-session";
import { isTrustedMutation } from "@/lib/request-security";

function getSafeRedirect(request: Request) {
  const redirect = new URL(request.url).searchParams.get("redirect");
  return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
}

export async function GET(request: Request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Nguồn điều hướng không hợp lệ." },
      { status: 403 },
    );
  }

  const redirectTo = getSafeRedirect(request);
  const login = await refreshSession();

  if (!login) {
    const response = NextResponse.redirect(
      new URL(`/dang-nhap?redirect=${encodeURIComponent(redirectTo)}`, request.url),
      303,
    );
    clearAuthCookies(response);
    return response;
  }

  const remember = (await cookies()).get(rememberSessionCookieName)?.value === "1";
  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
  setAuthCookies(response, login, remember);
  return response;
}
