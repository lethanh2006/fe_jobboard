import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuditTab } from "@/components/admin/admin-audit-tab";
import { AdminCompaniesTab } from "@/components/admin/admin-companies-tab";
import { AdminJobsTab } from "@/components/admin/admin-jobs-tab";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminUsersTab } from "@/components/admin/admin-users-tab";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { adminTabs, parseAdminTab } from "@/lib/admin-params";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Quản trị",
  description: "Kiểm duyệt tin tuyển dụng, công ty và tài khoản trên JobBoard.",
};

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireRole("Admin", "/quan-tri");
  const raw = await searchParams;
  const tab = parseAdminTab(raw);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="employer-page admin-page">
        <div className="shell employer-content">
          <section className="employer-welcome">
            <div>
              <span className="section-kicker">Quản trị hệ thống</span>
              <h1>Kiểm duyệt và vận hành</h1>
              <p>Gỡ tin vi phạm, khóa công ty hoặc tài khoản và theo dõi nhật ký thao tác.</p>
            </div>
          </section>

          <section className="management-card admin-card">
            <div className="management-tabs">
              <div>
                {adminTabs.map((item) => (
                  <Link
                    className={item.slug === tab ? "active" : ""}
                    href={`/quan-tri?tab=${item.slug}`}
                    key={item.slug}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {tab === "tong-quan" ? <AdminOverview accessToken={session.accessToken} /> : null}
            {tab === "tin" ? <AdminJobsTab accessToken={session.accessToken} raw={raw} /> : null}
            {tab === "cong-ty" ? <AdminCompaniesTab accessToken={session.accessToken} raw={raw} /> : null}
            {tab === "nguoi-dung" ? (
              <AdminUsersTab accessToken={session.accessToken} currentUserId={session.user.id} raw={raw} />
            ) : null}
            {tab === "nhat-ky" ? <AdminAuditTab accessToken={session.accessToken} raw={raw} /> : null}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
