import type { Metadata } from "next";
import { EmployerDashboard } from "@/components/employer-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getEmployerApplications, getEmployerJobs } from "@/lib/api";

export const metadata: Metadata = {
  title: "Bảng điều khiển nhà tuyển dụng",
  description: "Quản lý tin tuyển dụng và ứng viên trên JobBoard.",
};

export default async function EmployerPage() {
  const [jobs, applications] = await Promise.all([
    getEmployerJobs(1),
    getEmployerApplications(1),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="employer-page">
        <div className="shell employer-content">
          <EmployerDashboard
            initialEmployerJobs={jobs}
            initialApplications={applications}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
