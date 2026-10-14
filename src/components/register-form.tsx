"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";

type RegisterRole = "candidate" | "employer";

const copy = {
  candidate: {
    kicker: "Bắt đầu cùng JobBoard",
    title: "Tạo tài khoản ứng viên",
    description: "Tạo hồ sơ, ứng tuyển và theo dõi cơ hội phù hợp trong một nơi.",
    nameLabel: "Họ và tên",
    submit: "Tạo tài khoản",
    destination: "/ung-vien/ho-so",
    switchText: "Bạn là nhà tuyển dụng?",
    switchLink: { href: "/dang-ky/nha-tuyen-dung", label: "Đăng ký tuyển dụng" },
  },
  employer: {
    kicker: "Dành cho nhà tuyển dụng",
    title: "Đăng ký nhà tuyển dụng",
    description: "Tạo trang công ty, đăng tin và nhận hồ sơ phù hợp chỉ trong vài phút.",
    nameLabel: "Họ và tên người quản lý",
    submit: "Tạo tài khoản tuyển dụng",
    destination: "/nha-tuyen-dung",
    switchText: "Bạn đang tìm việc?",
    switchLink: { href: "/dang-ky", label: "Đăng ký ứng viên" },
  },
} as const;

export function RegisterForm({ role = "candidate" }: { role?: RegisterRole }) {
  const router = useRouter();
  const text = copy[role];
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
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
          role,
          name: field("name"),
          email: field("email"),
          password,
          ...(role === "employer"
            ? { companyName: field("companyName"), companyLocation: field("companyLocation") }
            : {}),
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

      router.push(text.destination);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tạo tài khoản.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-heading">
        <span className="section-kicker">{text.kicker}</span>
        <h1>{text.title}</h1>
        <p>{text.description}</p>
      </div>

      {role === "employer" ? (
        <>
          <label className="form-field">
            <span>Tên công ty</span>
            <input name="companyName" required maxLength={200} autoComplete="organization" />
          </label>
          <label className="form-field">
            <span>
              Địa điểm <em className="field-hint">(không bắt buộc)</em>
            </span>
            <input name="companyLocation" maxLength={200} placeholder="Ví dụ: TP. Hồ Chí Minh" />
          </label>
        </>
      ) : null}
      <label className="form-field">
        <span>{text.nameLabel}</span>
        <input name="name" required minLength={2} maxLength={160} autoComplete="name" />
      </label>
      <label className="form-field">
        <span>Email</span>
        <input name="email" type="email" required maxLength={320} autoComplete="email" />
      </label>
      <label className="form-field">
        <span>Mật khẩu</span>
        <input
          name="password"
          type="password"
          required
          minLength={10}
          maxLength={128}
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
          maxLength={128}
          autoComplete="new-password"
        />
      </label>
      <label className="terms-field">
        <input type="checkbox" required />
        <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật.</span>
      </label>

      <button className="button full-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang tạo tài khoản..." : text.submit}
      </button>

      {message ? <p className="integration-message" role="alert">{message}</p> : null}

      <p className="signup-note">
        Đã có tài khoản? <Link href="/dang-nhap">Đăng nhập</Link>
        <br />
        {text.switchText} <Link href={text.switchLink.href}>{text.switchLink.label}</Link>
      </p>
    </form>
  );
}
