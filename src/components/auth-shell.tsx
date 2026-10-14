import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

type AuthShellProps = {
  quote: string;
  proof: ReactNode;
  children: ReactNode;
};

/** Khung hai cột dùng chung cho các trang đăng nhập/đăng ký. */
export function AuthShell({ quote, proof, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="brand brand-light" href="/">
          <span className="brand-mark">
            <Icon name="briefcase" />
          </span>
          <span>JobBoard</span>
        </Link>
        <div className="auth-quote">
          <Icon name="sparkle" />
          <blockquote>{quote}</blockquote>
          <p>— Đội ngũ JobBoard</p>
        </div>
        <div className="auth-proof">
          <div className="auth-avatars">
            <span>AN</span>
            <span>TL</span>
            <span>QH</span>
          </div>
          <p>{proof}</p>
        </div>
      </section>
      <section className="auth-form-panel">
        <Link className="back-home" href="/">
          ← Quay lại trang chủ
        </Link>
        {children}
      </section>
    </main>
  );
}
