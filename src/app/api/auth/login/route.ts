import { NextResponse } from "next/server";
import { backendApiUrl } from "@/lib/api-config";
import { authCookieName } from "@/lib/server-auth";
import type { LoginResponse } from "@/types/auth";

type LoginPayload = {
  email?: string;
  password?: string;
  remember?: boolean;
};

export async function POST(request: Request) {
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
    response.cookies.set(authCookieName, login.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(payload.remember ? { expires: new Date(login.expiresAt) } : {}),
    });

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
