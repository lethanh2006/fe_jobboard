import { NextResponse } from "next/server";
import { backendApiUrl } from "@/lib/api-config";
import { isTrustedMutation } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { title: "Yêu cầu bị từ chối", detail: "Origin gửi yêu cầu không hợp lệ." },
      { status: 403 },
    );
  }

  let payload: { email?: string };
  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json(
      { title: "Dữ liệu không hợp lệ", detail: "Yêu cầu không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendApiUrl}/auth/forgot-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: payload.email }),
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

    // BE luôn trả 202 dù email có tồn tại hay không; giữ nguyên để không lộ tài khoản nào có thật.
    return NextResponse.json({ accepted: true }, { status: 202 });
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
