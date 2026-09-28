import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/icon";
import { RegisterForm } from "@/components/register-form";
import { getSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Đăng ký ứng viên",
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "Employer" ? "/nha-tuyen-dung" : "/ung-vien/ho-so");
  }

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
            “Một hồ sơ rõ ràng là bước đầu tiên để cơ hội phù hợp tìm thấy bạn.”
          </blockquote>
          <p>— Đội ngũ JobBoard</p>
        </div>
        <div className="auth-proof">
          <div className="auth-avatars">
            <span>AN</span>
            <span>TL</span>
            <span>QH</span>
          </div>
          <p><strong>Miễn phí</strong> cho ứng viên bắt đầu hành trình mới</p>
        </div>
      </section>
      <section className="auth-form-panel">
        <Link className="back-home" href="/">← Quay lại trang chủ</Link>
        <RegisterForm />
      </section>
    </main>
  );
}
