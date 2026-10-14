import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      quote="“Ai cũng có lúc quên mật khẩu — điều quan trọng là bạn quay lại đúng hướng.”"
      proof={
        <>
          Liên kết khôi phục được gửi tới <strong>email đã đăng ký</strong> của bạn
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
