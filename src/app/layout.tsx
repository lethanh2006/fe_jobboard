import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JobBoard — Công việc tốt, sự nghiệp đúng hướng",
    template: "%s | JobBoard",
  },
  description:
    "Khám phá việc làm phù hợp và kết nối với những đội ngũ tử tế trên JobBoard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
