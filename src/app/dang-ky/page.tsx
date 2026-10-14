import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
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
    <AuthShell
      quote="“Một hồ sơ rõ ràng là bước đầu tiên để cơ hội phù hợp tìm thấy bạn.”"
      proof={
        <>
          <strong>Miễn phí</strong> cho ứng viên bắt đầu hành trình mới
        </>
      }
    >
      <RegisterForm role="candidate" />
    </AuthShell>
  );
}
