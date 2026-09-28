import type { Metadata } from "next";
import { EmployerDashboard } from "@/components/employer-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getEmployerApplications, getEmployerJobs } from "@/lib/api";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Bảng điều khiển nhà tuyển dụng",
  description: "Quản lý tin tuyển dụng và ứng viên trên JobBoard.",
};

export default async function EmployerPage() {
  const session = await requireRole("Employer", "/nha-tuyen-dung");
  const companyId = session.user.companyId;
  if (companyId === null) {
    throw new Error("Tài khoản nhà tuyển dụng chưa được gắn với công ty.");
  }

  const [jobs, applications] = await Promise.all([
    getEmployerJobs(companyId, session.accessToken),
    getEmployerApplications(companyId, session.accessToken),
  ]);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="employer-page">
        <div className="shell employer-content">
          <EmployerDashboard
            companyId={companyId}
            companyName={session.user.companyName ?? `Công ty #${companyId}`}
            employerName={session.user.name}
            initialEmployerJobs={jobs}
            initialApplications={applications}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
