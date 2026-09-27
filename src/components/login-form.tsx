"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Giao diện đã sẵn sàng. Chức năng đăng nhập sẽ hoạt động khi API Identity/JWT được kết nối.",
    );
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

      <label className="form-field">
        <span>Email</span>
        <input name="email" type="email" required placeholder="ban@example.com" />
      </label>
      <label className="form-field">
        <span>Mật khẩu</span>
        <input name="password" type="password" required minLength={8} placeholder="Tối thiểu 8 ký tự" />
      </label>

      <div className="form-options">
        <label>
          <input type="checkbox" /> Ghi nhớ đăng nhập
        </label>
        <Link href="/dang-nhap">Quên mật khẩu?</Link>
      </div>

      <button className="button full-button" type="submit">
        Đăng nhập
      </button>

      {message ? <p className="integration-message">{message}</p> : null}

      <p className="signup-note">
        Chưa có tài khoản? <Link href="/dang-nhap">Tạo tài khoản miễn phí</Link>
      </p>
    </form>
  );
}
