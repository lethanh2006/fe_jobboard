import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LoginForm } from "@/components/login-form";
import { homePathFor } from "@/lib/role-routes";
import { getSession } from "@/lib/server-auth";
import { redirect as navigate } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; passwordChanged?: string; passwordReset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session) {
    navigate(homePathFor(session.user.role));
  }

  const { redirect, passwordChanged, passwordReset } = await searchParams;

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
          <blockquote>
            “Công việc phù hợp không chỉ dùng đúng kỹ năng — nó còn đưa bạn đến
            gần hơn với phiên bản mình muốn trở thành.”
          </blockquote>
          <p>— Đội ngũ JobBoard</p>
        </div>
        <div className="auth-proof">
          <div className="auth-avatars">
            <span>AN</span>
            <span>TL</span>
            <span>QH</span>
          </div>
          <p>
            <strong>12.000+</strong> ứng viên đang xây dựng sự nghiệp cùng JobBoard
          </p>
        </div>
      </section>
      <section className="auth-form-panel">
        <Link className="back-home" href="/">
          ← Quay lại trang chủ
        </Link>
        <LoginForm redirectTo={redirect} passwordChanged={passwordChanged === "1"} passwordReset={passwordReset === "1"} />
      </section>
    </main>
  );
}
