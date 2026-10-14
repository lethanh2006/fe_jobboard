import type { Metadata } from "next";
import Link from "next/link";
import { CompanyProfileForm } from "@/components/company-profile-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOwnCompany } from "@/lib/api";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Hồ sơ công ty",
};

type CompanyPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function EmployerCompanyPage({ searchParams }: CompanyPageProps) {
  const session = await requireRole("Employer", "/nha-tuyen-dung/cong-ty");
  const companyId = session.user.companyId;
  if (companyId === null) {
    throw new Error("Tài khoản nhà tuyển dụng chưa được gắn với công ty.");
  }

  const [company, { saved }] = await Promise.all([
    getOwnCompany(companyId, session.accessToken),
    searchParams,
  ]);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="profile-page">
        <section className="account-heading">
          <div className="shell">
            <span className="section-kicker">Hồ sơ công ty</span>
            <h1>Giới thiệu đội ngũ của bạn</h1>
            <p>
              Một trang công ty rõ ràng giúp ứng viên tin tưởng hơn.{" "}
              <Link className="inline-link" href={`/cong-ty/${company.id}`}>
                Xem trang công khai →
              </Link>
            </p>
          </div>
        </section>
        <div className="shell profile-content">
          <CompanyProfileForm company={company} saved={saved === "1"} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
