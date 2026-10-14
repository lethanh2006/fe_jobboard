"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { homePathFor } from "@/lib/role-routes";
import type { AuthUser } from "@/types/auth";

export function LoginForm({
  redirectTo,
  passwordChanged = false,
}: {
  redirectTo?: string;
  passwordChanged?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          remember: form.get("remember") === "on",
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        user?: AuthUser;
        detail?: string;
        title?: string;
      };

      if (!response.ok || !body.user) {
        throw new Error(body.detail ?? body.title ?? "Không thể đăng nhập.");
      }

      const safeRedirect =
        redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : undefined;
      router.push(safeRedirect ?? homePathFor(body.user.role));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đăng nhập.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="section-kicker">Chào mừng trở lại</span>
        <h1>Đăng nhập JobBoard</h1>
        <p>Tiếp tục hành trình nghề nghiệp hoặc quản lý đội ngũ của bạn.</p>
      </div>

      {redirectTo ? (
        <div className="login-notice">
          <Icon name="briefcase" />
          Đăng nhập để tiếp tục ứng tuyển công việc bạn đã chọn.
        </div>
      ) : null}

      {passwordChanged ? (
        <div className="login-notice">
          <Icon name="check" />
          Đổi mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.
        </div>
      ) : null}

      <label className="form-field">
        <span>Email</span>
        <input name="email" type="email" required placeholder="candidate@jobboard.vn" />
      </label>
      <label className="form-field">
        <span>Mật khẩu</span>
        <input name="password" type="password" required minLength={8} placeholder="Tối thiểu 8 ký tự" />
      </label>

      <div className="form-options">
        <label>
          <input name="remember" type="checkbox" /> Ghi nhớ đăng nhập
        </label>
        <Link href="/dang-nhap">Quên mật khẩu?</Link>
      </div>

      <button className="button full-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      {message ? <p className="integration-message">{message}</p> : null}

      <div className="demo-login-hint">
        <strong>Tài khoản demo</strong>
        <span>Ứng viên: candidate@jobboard.vn</span>
        <span>Nhà tuyển dụng: employer@jobboard.vn</span>
        <span>Mật khẩu: JobBoard@123</span>
      </div>

      <p className="signup-note">
        Chưa có tài khoản? <Link href="/dang-ky">Tạo tài khoản miễn phí</Link>
      </p>
    </form>
  );
}
