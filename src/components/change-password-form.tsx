"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ChangePasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const passwordConfirmation = String(form.get("passwordConfirmation") ?? "");

    if (newPassword !== passwordConfirmation) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/backend/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const problem = (await response.json().catch(() => ({}))) as {
          detail?: string;
          title?: string;
        };
        throw new Error(problem.detail ?? problem.title ?? "Không thể đổi mật khẩu.");
      }

      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/dang-nhap?passwordChanged=1");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đổi mật khẩu.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="profile-form-card password-form-card" onSubmit={handleSubmit}>
      <div className="profile-form-heading">
        <div className="avatar profile-avatar">MK</div>
        <div>
          <h2>Cập nhật mật khẩu</h2>
          <p>Tất cả phiên đăng nhập khác sẽ bị thu hồi sau khi cập nhật.</p>
        </div>
      </div>

      <div className="form-grid password-form-grid">
        <label className="form-field full-field">
          <span>Mật khẩu hiện tại</span>
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <label className="form-field">
          <span>Mật khẩu mới</span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <small>Tối thiểu 10 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</small>
        </label>
        <label className="form-field">
          <span>Xác nhận mật khẩu mới</span>
          <input
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </label>
      </div>

      <div className="profile-form-actions">
        <span className={message ? "password-form-message" : undefined}>{message}</span>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </button>
      </div>
    </form>
  );
}
