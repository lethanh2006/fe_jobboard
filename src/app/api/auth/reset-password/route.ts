import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";
import { backendApiUrl } from "@/lib/api-config";
import { clientForwardingHeaders } from "@/lib/client-ip";
import { isTrustedMutation } from "@/lib/request-security";

type ResetPayload = {
  token?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Origin gửi yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  let payload: ResetPayload;
  try {
    payload = (await request.json()) as ResetPayload;
  } catch {
    return NextResponse.json(
      { title: "Dữ liệu không hợp lệ", detail: "Yêu cầu không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendApiUrl}/auth/reset-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...clientForwardingHeaders(request),
      },
      body: JSON.stringify({ token: payload.token, newPassword: payload.newPassword }),
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

    // BE đã thu hồi mọi phiên của tài khoản; xóa cookie cũ ở trình duyệt này để không giữ phiên chết.
    const response = NextResponse.json({ reset: true });
    clearAuthCookies(response);
    return response;
  } catch {
    return NextResponse.json(
      {
        title: "Không thể kết nối",
        detail: "Dịch vụ khôi phục mật khẩu đang tạm thời không khả dụng.",
      },
      { status: 503 },
    );
  }
}
