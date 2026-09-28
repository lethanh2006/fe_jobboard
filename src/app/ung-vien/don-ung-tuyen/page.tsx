import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationStatus } from "@/components/application-status";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCandidateApplications, getJobs } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/server-auth";
import type { JobApplication } from "@/types/job";

export const metadata: Metadata = {
  title: "Đơn ứng tuyển của tôi",
  description: "Theo dõi tiến trình các đơn ứng tuyển trên JobBoard.",
};

export default async function CandidateApplicationsPage() {
  const session = await requireRole("Candidate", "/ung-vien/don-ung-tuyen");
  const [applicationHistory, jobs] = await Promise.all([
    getCandidateApplications(session.user.id, session.accessToken),
    getJobs(),
  ]);
  const applications = applicationHistory.flatMap((application) => {
    const job = jobs.find((item) => item.id === application.jobId);
    return job ? [{ application, job }] : [];
  });
  const recommendations = jobs
    .filter((job) => !applicationHistory.some((item) => item.jobId === job.id))
    .slice(0, 3);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="candidate-page">
        <section className="account-heading">
          <div className="shell account-heading-inner">
            <div>
              <span className="section-kicker">Không gian ứng viên</span>
              <h1>Chào {session.user.name},</h1>
              <p>Theo dõi hành trình ứng tuyển và đừng bỏ lỡ cập nhật mới.</p>
            </div>
            <div className="profile-progress">
              <div className="progress-ring">78%</div>
              <div>
                <strong>Hồ sơ khá tốt</strong>
                <span>Thêm kinh nghiệm để nổi bật hơn</span>
              </div>
              <Link className="arrow-link" href="/ung-vien/ho-so">
                Hoàn thiện hồ sơ <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </section>

        <div className="shell candidate-content">
          <section>
            <div className="dashboard-section-heading">
              <div>
                <h2>Đơn ứng tuyển của bạn</h2>
                <p>{applications.length} đơn trong 30 ngày gần nhất</p>
              </div>
              <Link className="button button-small" href="/viec-lam">
                Tìm thêm việc làm
              </Link>
            </div>

            <div className="application-list">
              {applications.map(({ application, job }) => (
                <article className="application-card" key={application.id}>
                  <div className={`company-logo logo-${job.logoTone}`}>{job.logoText}</div>
                  <div className="application-main">
                    <div className="application-title-row">
                      <div>
                        <Link href={`/viec-lam/${job.id}`}>{job.title}</Link>
                        <span>{job.company}</span>
                      </div>
                      <ApplicationStatus status={application.status} />
                    </div>
                    <div className="application-meta">
                      <span>
                        <Icon name="location" /> {job.location}
                      </span>
                      <span>
                        <Icon name="clock" /> Ứng tuyển {formatDate(application.appliedAt)}
                      </span>
                    </div>
                    <ApplicationProgress status={application.status} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="candidate-sidebar">
            <div className="candidate-summary-card">
              <span className="section-kicker">Tổng quan</span>
              <div className="candidate-stat-grid">
                <div>
                  <strong>3</strong>
                  <span>Đã ứng tuyển</span>
                </div>
                <div>
                  <strong>1</strong>
                  <span>Đang xem xét</span>
                </div>
                <div>
                  <strong>14</strong>
                  <span>Lượt xem hồ sơ</span>
                </div>
                <div>
                  <strong>8</strong>
                  <span>Việc đã lưu</span>
                </div>
              </div>
            </div>
            <div className="candidate-tip-card">
              <span className="mini-icon coral-icon">
                <Icon name="sparkle" />
              </span>
              <h3>Tăng cơ hội được chú ý</h3>
              <p>Nhà tuyển dụng ưu tiên hồ sơ có dự án gần đây và kỹ năng được mô tả rõ.</p>
              <Link href="/ung-vien/ho-so">Cập nhật hồ sơ →</Link>
            </div>
          </aside>
        </div>

        <section className="section related-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Gợi ý cho bạn</span>
                <h2>Cơ hội phù hợp khác</h2>
              </div>
              <Link className="arrow-link" href="/viec-lam">
                Xem tất cả <Icon name="arrow" />
              </Link>
            </div>
            <div className="featured-grid">
              {recommendations.map((job) => (
                <JobCard job={job} key={job.id} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ApplicationProgress({ status }: { status: JobApplication["status"] }) {
  const currentStep = status === "Submitted" ? 1 : status === "Reviewing" ? 2 : 3;
  const finalLabel = status === "Accepted" ? "Đã chấp nhận" : status === "Rejected" ? "Kết thúc" : "Kết quả";

  return (
    <div className={`application-progress progress-${status.toLowerCase()}`}>
      {["Đã nộp", "Xem xét", finalLabel].map((label, index) => (
        <div className={index < currentStep ? "complete" : ""} key={label}>
          <span>{index < currentStep ? <Icon name="check" /> : index + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
