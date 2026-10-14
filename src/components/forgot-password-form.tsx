"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";

/** Chờ giữa hai lần gửi để người dùng không bấm dồn; BE vẫn giới hạn số email mỗi giờ. */
const resendSeconds = 60;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function send(email: string) {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const problem = (await response.json().catch(() => ({}))) as { detail?: string; title?: string };
        throw new Error(problem.detail ?? problem.title ?? "Không thể gửi yêu cầu lúc này.");
      }

      setSentTo(email);
      setCooldown(resendSeconds);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể gửi yêu cầu lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    void send(email);
  }

  if (sentTo) {
    return (
      <div className="login-form">
        <div className="login-heading">
          <span className="section-kicker">Kiểm tra hộp thư</span>
          <h1>Đã gửi hướng dẫn</h1>
          <p>
            Nếu <strong className="recovery-email">{sentTo}</strong> đã đăng ký tại JobBoard, chúng tôi vừa gửi
            một liên kết để đặt lại mật khẩu.
          </p>
        </div>

        <div className="login-notice">
          <Icon name="clock" />
          Liên kết chỉ dùng được một lần và hết hạn sau một thời gian ngắn. Hãy kiểm tra cả thư rác.
        </div>

        <button
          className="button full-button"
          type="button"
          disabled={isSubmitting || cooldown > 0}
          onClick={() => void send(sentTo)}
        >
          {isSubmitting ? "Đang gửi..." : cooldown > 0 ? `Gửi lại sau ${cooldown} giây` : "Gửi lại liên kết"}
        </button>

        {message ? <p className="integration-message" role="alert">{message}</p> : null}

        <div className="recovery-actions">
          <button className="text-button" type="button" onClick={() => setSentTo(null)}>
            Dùng email khác
          </button>
          <Link href="/dang-nhap">Quay lại đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="section-kicker">Khôi phục tài khoản</span>
        <h1>Quên mật khẩu?</h1>
        <p>Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn chọn mật khẩu mới.</p>
      </div>

      <label className="form-field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required placeholder="ban@example.com" />
      </label>

      <button className="button full-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}
      </button>

      {message ? <p className="integration-message" role="alert">{message}</p> : null}

      <p className="signup-note">
        Nhớ ra mật khẩu? <Link href="/dang-nhap">Quay lại đăng nhập</Link>
      </p>
    </form>
  );
}
