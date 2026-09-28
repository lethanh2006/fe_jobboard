"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";

export function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (password !== confirmation) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          password,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        user?: AuthUser;
        detail?: string;
        title?: string;
      };

      if (!response.ok || !body.user) {
        throw new Error(body.detail ?? body.title ?? "Không thể tạo tài khoản.");
      }

      router.push("/ung-vien/ho-so");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tạo tài khoản.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="section-kicker">Bắt đầu cùng JobBoard</span>
        <h1>Tạo tài khoản ứng viên</h1>
        <p>Tạo hồ sơ, ứng tuyển và theo dõi cơ hội phù hợp trong một nơi.</p>
      </div>

      <label className="form-field">
        <span>Họ và tên</span>
        <input name="name" required minLength={2} maxLength={160} autoComplete="name" />
      </label>
      <label className="form-field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="form-field">
        <span>Mật khẩu</span>
        <input
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
        <small>Ít nhất 10 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.</small>
      </label>
      <label className="form-field">
        <span>Xác nhận mật khẩu</span>
        <input
          name="confirmation"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
        />
      </label>
      <label className="terms-field">
        <input type="checkbox" required />
        <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật.</span>
      </label>

      <button className="button full-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      {message ? <p className="integration-message" role="alert">{message}</p> : null}

      <p className="signup-note">
        Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
      </p>
    </form>
  );
}
