import type { Metadata } from "next";
import { EmployerDashboard } from "@/components/employer-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Bảng điều khiển nhà tuyển dụng",
  description: "Quản lý tin tuyển dụng và ứng viên trên JobBoard.",
};

export default function EmployerPage() {
  return (
    <>
      <SiteHeader />
      <main className="employer-page">
        <div className="shell employer-content">
          <EmployerDashboard />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
