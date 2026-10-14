import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ResetLinkInvalid } from "@/components/reset-link-invalid";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  // Token nằm trên URL: không gửi kèm Referer sang trang khác và không để công cụ tìm kiếm lập chỉ mục.
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;

  return (
    <AuthShell
      quote="“Một mật khẩu mới, một khởi đầu an toàn hơn.”"
      proof={
        <>
          Mật khẩu mạnh giúp <strong>hồ sơ và dữ liệu</strong> của bạn luôn an toàn
        </>
      }
    >
      {value ? <ResetPasswordForm token={value} /> : <ResetLinkInvalid />}
    </AuthShell>
  );
}
