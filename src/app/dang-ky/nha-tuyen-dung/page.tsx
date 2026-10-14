import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { homePathFor } from "@/lib/role-routes";
import { getSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Đăng ký nhà tuyển dụng",
};

export default async function RegisterEmployerPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "Candidate" ? "/ung-vien/ho-so" : homePathFor(session.user.role));
  }

  return (
    <AuthShell
      quote="“Đội ngũ tốt bắt đầu từ một vị trí được mô tả rõ ràng và một quy trình tuyển dụng minh bạch.”"
      proof={
        <>
          <strong>Đăng tin ngay</strong> sau khi tạo trang công ty
        </>
      }
    >
      <RegisterForm role="employer" />
    </AuthShell>
  );
}
