"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ResetLinkInvalid, resetLinkInvalidTitle } from "@/components/reset-link-invalid";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (newPassword !== confirmation) {
      setMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const problem = (await response.json().catch(() => ({}))) as { detail?: string; title?: string };
        if (problem.title === resetLinkInvalidTitle) {
          setLinkInvalid(true);
          return;
        }
        throw new Error(problem.detail ?? problem.title ?? "Không thể đặt lại mật khẩu.");
      }

      router.replace("/dang-nhap?passwordReset=1");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (linkInvalid) {
    return <ResetLinkInvalid />;
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="section-kicker">Khôi phục tài khoản</span>
        <h1>Đặt lại mật khẩu</h1>
        <p>Chọn mật khẩu mới cho tài khoản của bạn. Mọi phiên đăng nhập hiện có sẽ bị đăng xuất.</p>
      </div>

      <label className="form-field">
        <span>Mật khẩu mới</span>
        <input name="newPassword" type="password" autoComplete="new-password" minLength={10} required />
        <small>Tối thiểu 10 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</small>
      </label>
      <label className="form-field">
        <span>Xác nhận mật khẩu mới</span>
        <input name="confirmation" type="password" autoComplete="new-password" minLength={10} required />
      </label>

      <button className="button full-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </button>

      {message ? <p className="integration-message" role="alert">{message}</p> : null}
    </form>
  );
}
