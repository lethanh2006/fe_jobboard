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

export default async function EmployerPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialView = params.tab === "candidates" ? "candidates" : "jobs";
  const requestedId = Number(params.application);
  const applicationId = Number.isSafeInteger(requestedId) && requestedId > 0 ? requestedId : null;
  const query = new URLSearchParams({ tab: initialView });
  if (applicationId !== null) query.set("application", String(applicationId));
  const session = await requireRole("Employer", `/nha-tuyen-dung?${query}`);
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
            key={`${initialView}-${applicationId}`}
            initialView={initialView}
            initialApplicationId={applications.some((item) => item.id === applicationId) ? applicationId : null}
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
