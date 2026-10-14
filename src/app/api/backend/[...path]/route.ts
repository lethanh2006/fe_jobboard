import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  accessTokenCookieName,
  clearAuthCookies,
  rememberSessionCookieName,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { backendApiUrl } from "@/lib/api-config";
import { refreshSession } from "@/lib/refresh-session";
import { isTrustedMutation } from "@/lib/request-security";
import type { LoginResponse } from "@/types/auth";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/** Header cần giữ nguyên khi backend trả tệp (tên tệp tải về, không cho đoán kiểu, không cache). */
function forwardedHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of ["content-disposition", "x-content-type-options", "cache-control"]) {
    const value = response.headers.get(name);
    if (value) {
      headers[name] = value;
    }
  }

  return headers;
}

async function proxy(request: Request, context: RouteContext) {
  if (!["GET", "HEAD"].includes(request.method) && !isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Origin gửi yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetPath = path.map(encodeURIComponent).join("/");
  const targetUrl = `${backendApiUrl}/${targetPath}${incomingUrl.search}`;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessTokenCookieName)?.value;
  const contentType = request.headers.get("content-type");
  const requestBody = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  function forward(token?: string) {
    const headers = new Headers({ Accept: "application/json" });
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(targetUrl, {
      method: request.method,
      headers,
      body: requestBody,
      cache: "no-store",
    });
  }

  try {
    let backendResponse = await forward(accessToken);
    let refreshedLogin: LoginResponse | null = null;

    if (backendResponse.status === 401) {
      refreshedLogin = await refreshSession();
      if (refreshedLogin) {
        await backendResponse.body?.cancel();
        backendResponse = await forward(refreshedLogin.accessToken);
      }
    }

    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
        ...forwardedHeaders(backendResponse),
      },
    });

    if (refreshedLogin) {
      const remember = cookieStore.get(rememberSessionCookieName)?.value === "1";
      setAuthCookies(response, refreshedLogin, remember);
    } else if (backendResponse.status === 401) {
      clearAuthCookies(response);
    }

    return response;
  } catch {
    return Response.json(
      {
        title: "Không thể kết nối",
        detail: "JobBoard API đang tạm thời không khả dụng.",
      },
      { status: 503 },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
