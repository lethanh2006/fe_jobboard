import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/change-password-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
};

export default async function ChangePasswordPage() {
  const session = await requireSession("/tai-khoan/doi-mat-khau");

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="security-page">
        <section className="account-heading">
          <div className="shell">
            <span className="section-kicker">Bảo mật tài khoản</span>
            <h1>Đổi mật khẩu</h1>
            <p>Dùng mật khẩu riêng, khó đoán và chưa từng sử dụng ở nơi khác.</p>
          </div>
        </section>
        <div className="shell profile-content">
          <ChangePasswordForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
