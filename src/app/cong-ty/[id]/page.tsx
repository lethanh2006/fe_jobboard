import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCompany, getLogoText, logoToneFor, searchJobs } from "@/lib/api";
import { getSession } from "@/lib/server-auth";

type CompanyPageProps = {
  params: Promise<{ id: string }>;
};

const parseId = (value: string) => (/^\d+$/.test(value) ? Number(value) : null);

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  const company = id === null ? undefined : await getCompany(id);

  return company
    ? { title: company.name, description: company.description ?? `Việc làm tại ${company.name}` }
    : { title: "Không tìm thấy công ty" };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const id = parseId((await params).id);
  const company = id === null ? undefined : await getCompany(id);

  if (id === null || !company) {
    notFound();
  }

  const [session, jobs] = await Promise.all([
    getSession(),
    searchJobs({ companyId: id, pageSize: 50 }).catch(() => null),
  ]);

  return (
    <>
      <SiteHeader user={session?.user ?? null} />
      <main className="job-detail-page">
        <div className="shell breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/viec-lam">Việc làm</Link>
          <span>/</span>
          <strong>{company.name}</strong>
        </div>

        <section className="job-detail-hero">
          <div className="shell job-detail-heading">
            <div className={`company-logo detail-logo logo-${logoToneFor(company.id)}`}>
              {getLogoText(company.name)}
            </div>
            <div className="job-heading-copy">
              <span>Nhà tuyển dụng</span>
              <h1>{company.name}</h1>
              <div className="job-heading-meta">
                {company.location ? (
                  <span>
                    <Icon name="location" /> {company.location}
                  </span>
                ) : null}
                {company.website ? (
                  <span>
                    <Icon name="arrow" />{" "}
                    <a href={company.website} target="_blank" rel="noopener noreferrer nofollow">
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="shell company-page-content">
          <article className="job-description-card">
            <section className="detail-section">
              <h2>Về công ty</h2>
              <p className="company-description">
                {company.description ?? "Công ty chưa cập nhật phần giới thiệu."}
              </p>
            </section>
          </article>
        </div>

        <section className="section related-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Đang tuyển</span>
                <h2>
                  {jobs ? `${jobs.totalItems} vị trí` : "Vị trí"} tại {company.name}
                </h2>
              </div>
            </div>
            {jobs && jobs.items.length > 0 ? (
              <div className="featured-grid">
                {jobs.items.map((job) => (
                  <JobCard job={job} key={job.id} />
                ))}
              </div>
            ) : (
              <p className="recommendation-empty">
                {jobs ? "Hiện công ty chưa có vị trí nào đang tuyển." : "Không thể tải danh sách việc làm lúc này."}
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
