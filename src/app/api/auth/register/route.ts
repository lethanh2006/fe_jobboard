import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { backendApiUrl } from "@/lib/api-config";
import { isTrustedMutation } from "@/lib/request-security";
import type { LoginResponse } from "@/types/auth";

type RegistrationPayload = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Origin gửi yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  let payload: RegistrationPayload;
  try {
    payload = (await request.json()) as RegistrationPayload;
  } catch {
    return NextResponse.json(
      { title: "Dữ liệu không hợp lệ", detail: "Yêu cầu đăng ký không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendApiUrl}/auth/register/candidate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

    const registration = (await backendResponse.json()) as LoginResponse;
    const response = NextResponse.json({ user: registration.user }, { status: 201 });
    setAuthCookies(response, registration, true);
    return response;
  } catch {
    return NextResponse.json(
      {
        title: "Không thể kết nối",
        detail: "Dịch vụ đăng ký đang tạm thời không khả dụng.",
      },
      { status: 503 },
    );
  }
}
