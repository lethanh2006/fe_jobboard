import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { backendApiUrl } from "@/lib/api-config";
import { isTrustedMutation } from "@/lib/request-security";
import type { LoginResponse } from "@/types/auth";

type LoginPayload = {
  email?: string;
  password?: string;
  remember?: boolean;
};

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Origin gửi yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json(
      { title: "Dữ liệu không hợp lệ", detail: "Yêu cầu đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendApiUrl}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      return new NextResponse(await backendResponse.text(), {
        status: backendResponse.status,
        headers: {
          "Content-Type": backendResponse.headers.get("content-type") ?? "application/problem+json",
        },
      });
    }

    const login = (await backendResponse.json()) as LoginResponse;
    const response = NextResponse.json({ user: login.user });
    setAuthCookies(response, login, payload.remember === true);

    return response;
  } catch {
    return NextResponse.json(
      {
        title: "Không thể kết nối",
        detail: "Dịch vụ đăng nhập đang tạm thời không khả dụng.",
      },
      { status: 503 },
    );
  }
}
