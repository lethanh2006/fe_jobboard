import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyButton } from "@/components/apply-button";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { JobMatchCard } from "@/components/job-match-card";
import { SaveJobButton } from "@/components/save-job-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { jobs as fallbackJobs } from "@/data/jobs";
import {
  getCandidateApplications,
  getCandidateProfile,
  getCompany,
  getJobById,
  getJobMatches,
  getSavedJobIds,
  searchJobs,
} from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/format";
import { getSession } from "@/lib/server-auth";
import type { Job } from "@/types/job";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return fallbackJobs.map((job) => ({ id: String(job.id) }));
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
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

  const session = await getSession();
  const candidate = session?.user.role === "Candidate" ? session : null;
  const [company, sameCategory, newest, match, applications, savedIds, profile] = await Promise.all([
    getCompany(job.companyId).catch(() => undefined),
    searchJobs({ category: job.category, pageSize: 4 }).catch(() => null),
    searchJobs({ pageSize: 6 }).catch(() => null),
    candidate
      ? getJobMatches(candidate.user.id, [job.id], candidate.accessToken)
          .then((matches) => matches[0] ?? null)
          .catch(() => null)
      : null,
    candidate
      ? getCandidateApplications(
          candidate.user.id,
          candidate.accessToken,
        ).catch(() => [])
      : [],
    candidate
      ? getSavedJobIds([job.id], candidate.accessToken).catch(() => null)
      : ([] as number[]),
    candidate
      ? getCandidateProfile(candidate.user.id, candidate.accessToken).catch(() => null)
      : null,
  ]);
  // Ưu tiên cùng lĩnh vực, thiếu thì bổ sung tin mới nhất để mục này không bị trống.
  const relatedJobs = [...(sameCategory?.items ?? []), ...(newest?.items ?? [])]
    .filter(
      (item, index, all) =>
        item.id !== job.id &&
        all.findIndex((other) => other.id === item.id) === index,
    )
    .slice(0, 3);
  const alreadyApplied = applications.some(
    (application) => application.jobId === job.id,
  );
  const unavailableReason = getUnavailableReason(job, session?.user.role);

  return (
    <>
      <SiteHeader user={session?.user ?? null} />
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
            <div className={`company-logo detail-logo logo-${job.logoTone}`}>
              {job.logoText}
            </div>
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
            <ApplyButton
              jobId={job.id}
              alreadyApplied={alreadyApplied}
              unavailableReason={unavailableReason}
            />
          </div>
        </section>

        <div className="shell job-detail-layout">
          <article className="job-description-card">
            <p className="job-lead">{job.summary}</p>

            <JobSection title="Bạn sẽ làm gì" items={job.description} />
            <JobSection
              title="Điều chúng tôi tìm kiếm"
              items={job.requirements}
            />
            <JobSection
              title="Quyền lợi dành cho bạn"
              items={job.benefits}
              checked
            />

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
              <ApplyButton
                jobId={job.id}
                fullWidth
                alreadyApplied={alreadyApplied}
                unavailableReason={unavailableReason}
              />
              {candidate && profile && !alreadyApplied && !unavailableReason ? (
                <p className="cv-note">
                  <Icon name="paperclip" />
                  {profile.cv ? (
                    <span>
                      Đơn sẽ đính kèm CV <strong>{profile.cv.fileName}</strong>.
                    </span>
                  ) : (
                    <span>
                      Bạn chưa có CV. <Link href="/ung-vien/ho-so">Tải CV lên</Link> để nhà tuyển dụng
                      xem hồ sơ đầy đủ hơn.
                    </span>
                  )}
                </p>
              ) : null}
              {!session || candidate ? (
                <SaveJobButton
                  key={`${job.id}-${savedIds?.includes(job.id)}`}
                  jobId={job.id}
                  initialSaved={savedIds === null ? null : savedIds.includes(job.id)}
                  guest={!session}
                  available={job.status !== "Closed" && !job.expired}
                  returnPath={`/viec-lam/${job.id}`}
                />
              ) : null}
              <p className="safe-note">
                Hồ sơ của bạn chỉ được gửi khi bạn xác nhận.
              </p>
            </div>

            {match ? <JobMatchCard match={match} /> : null}

            <div className="company-summary-card">
              <div className={`company-logo logo-${job.logoTone}`}>{job.logoText}</div>
              <div>
                <strong>
                  <Link href={`/cong-ty/${job.companyId}`}>{job.company}</Link>
                </strong>
                <span>{company?.location ?? job.location}</span>
              </div>
              <p>
                {company?.description
                  ? company.description.length > 220
                    ? `${company.description.slice(0, 220).trimEnd()}…`
                    : company.description
                  : "Công ty chưa cập nhật phần giới thiệu."}
              </p>
              <Link className="arrow-link company-card-link" href={`/cong-ty/${job.companyId}`}>
                Xem trang công ty <Icon name="arrow" />
              </Link>
            </div>
          </aside>
        </div>

        {relatedJobs.length > 0 ? (
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
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

/** Lý do không cho ứng tuyển, hiển thị ngay trên nút. */
function getUnavailableReason(job: Job, role?: string) {
  if (job.status === "Closed") {
    return "Tin đã đóng";
  }
  if (job.expired) {
    return "Đã hết hạn nhận hồ sơ";
  }
  if (role === "Employer" || role === "Admin") {
    return "Chỉ ứng viên mới ứng tuyển được";
  }

  return undefined;
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
