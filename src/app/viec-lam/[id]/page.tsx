import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyButton } from "@/components/apply-button";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { jobs as fallbackJobs } from "@/data/jobs";
import { getJobById, getJobs } from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/format";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return fallbackJobs.map((job) => ({ id: String(job.id) }));
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(Number(id));

  return job
    ? {
        title: job.title,
        description: `${job.title} tại ${job.company} — ${job.summary}`,
      }
    : { title: "Không tìm thấy việc làm" };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJobById(Number(id));

  if (!job) {
    notFound();
  }

  const relatedJobs = (await getJobs())
    .filter((item) => item.id !== job.id)
    .sort((first, second) => {
      const firstScore = first.category === job.category ? 1 : 0;
      const secondScore = second.category === job.category ? 1 : 0;
      return secondScore - firstScore;
    })
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="job-detail-page">
        <div className="shell breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/viec-lam">Việc làm</Link>
          <span>/</span>
          <strong>{job.title}</strong>
        </div>

        <section className="job-detail-hero">
          <div className="shell job-detail-heading">
            <div className={`company-logo detail-logo logo-${job.logoTone}`}>{job.logoText}</div>
            <div className="job-heading-copy">
              <span>{job.company}</span>
              <h1>{job.title}</h1>
              <div className="job-heading-meta">
                <span>
                  <Icon name="location" /> {job.location}
                </span>
                <span>
                  <Icon name="briefcase" /> {job.workMode}
                </span>
                <span>
                  <Icon name="clock" /> Đăng ngày {formatDate(job.postedAt)}
                </span>
              </div>
            </div>
            <ApplyButton jobId={job.id} />
          </div>
        </section>

        <div className="shell job-detail-layout">
          <article className="job-description-card">
            <p className="job-lead">{job.summary}</p>

            <JobSection title="Bạn sẽ làm gì" items={job.description} />
            <JobSection title="Điều chúng tôi tìm kiếm" items={job.requirements} />
            <JobSection title="Quyền lợi dành cho bạn" items={job.benefits} checked />

            <section className="detail-section">
              <h2>Kỹ năng liên quan</h2>
              <div className="detail-skills">
                {job.skills.map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </article>

          <aside className="job-detail-sidebar">
            <div className="apply-card">
              <span className="section-kicker">Tổng quan</span>
              <div className="overview-item">
                <Icon name="chart" />
                <div>
                  <span>Mức lương</span>
                  <strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
                </div>
              </div>
              <div className="overview-item">
                <Icon name="briefcase" />
                <div>
                  <span>Cấp bậc</span>
                  <strong>{job.level}</strong>
                </div>
              </div>
              <div className="overview-item">
                <Icon name="code" />
                <div>
                  <span>Lĩnh vực</span>
                  <strong>{job.category}</strong>
                </div>
              </div>
              <div className="overview-item">
                <Icon name="clock" />
                <div>
                  <span>Hạn ứng tuyển</span>
                  <strong>{formatDate(job.deadline)}</strong>
                </div>
              </div>
              <ApplyButton jobId={job.id} fullWidth />
              <p className="safe-note">Hồ sơ của bạn chỉ được gửi khi bạn xác nhận.</p>
            </div>

            <div className="company-summary-card">
              <div className={`company-logo logo-${job.logoTone}`}>{job.logoText}</div>
              <div>
                <strong>{job.company}</strong>
                <span>Nhà tuyển dụng đã xác minh</span>
              </div>
              <p>
                Đội ngũ đề cao sự chủ động, học hỏi liên tục và những sản phẩm tạo
                ra giá trị thực cho người dùng.
              </p>
            </div>
          </aside>
        </div>

        <section className="section related-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Có thể bạn quan tâm</span>
                <h2>Việc làm tương tự</h2>
              </div>
              <Link className="arrow-link" href="/viec-lam">
                Xem tất cả <Icon name="arrow" />
              </Link>
            </div>
            <div className="featured-grid">
              {relatedJobs.map((relatedJob) => (
                <JobCard job={relatedJob} key={relatedJob.id} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function JobSection({
  title,
  items,
  checked = false,
}: {
  title: string;
  items: string[];
  checked?: boolean;
}) {
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <ul className={checked ? "checked-list" : "bullet-list"}>
        {items.map((item) => (
          <li key={item}>
            {checked ? <Icon name="check" /> : null}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
