import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationStatus } from "@/components/application-status";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getCandidateApplications,
  getCandidateProfile,
  getLogoText,
  getRecommendedJobs,
  logoToneFor,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/server-auth";
import type { CandidateProfile, JobApplication } from "@/types/job";

export const metadata: Metadata = {
  title: "Đơn ứng tuyển của tôi",
  description: "Theo dõi tiến trình các đơn ứng tuyển trên JobBoard.",
};

/** Mức hoàn thiện hồ sơ: giới thiệu 30%, kỹ năng (đủ 3 kỹ năng) 40%, khoảng lương 30%. */
function profileCompleteness(profile: CandidateProfile) {
  const bio = (profile.bio?.trim().length ?? 0) >= 30 ? 30 : 0;
  const skills = Math.round(Math.min(profile.skills.length, 3) * (40 / 3));
  const salary = profile.desiredSalaryMin !== null && profile.desiredSalaryMax !== null ? 30 : 0;

  return bio + skills + salary;
}

export default async function CandidateApplicationsPage() {
  const session = await requireRole("Candidate", "/ung-vien/don-ung-tuyen");
  const [applications, profile, recommendations] = await Promise.all([
    getCandidateApplications(session.user.id, session.accessToken),
    getCandidateProfile(session.user.id, session.accessToken),
    getRecommendedJobs(session.user.id, session.accessToken, 3).catch(() => []),
  ]);
  const completeness = profileCompleteness(profile);
  const countByStatus = (status: JobApplication["status"]) =>
    applications.filter((application) => application.status === status).length;

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
              <div className="progress-ring">{completeness}%</div>
              <div>
                <strong>{completeness >= 100 ? "Hồ sơ đã đầy đủ" : "Hồ sơ cần bổ sung"}</strong>
                <span>
                  {completeness >= 100
                    ? "Bạn sẽ nhận được gợi ý việc làm chính xác nhất"
                    : "Thêm giới thiệu, kỹ năng và mức lương mong muốn"}
                </span>
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
                <p>{applications.length} đơn đã nộp</p>
              </div>
              <Link className="button button-small" href="/viec-lam">
                Tìm thêm việc làm
              </Link>
            </div>

            {applications.length > 0 ? (
              <div className="application-list">
                {applications.map((application) => (
                  <article className="application-card" key={application.id}>
                    <div className={`company-logo logo-${logoToneFor(application.jobId)}`}>
                      {getLogoText(application.company)}
                    </div>
                    <div className="application-main">
                      <div className="application-title-row">
                        <div>
                          <Link href={`/viec-lam/${application.jobId}`}>{application.jobTitle}</Link>
                          <span>{application.company}</span>
                        </div>
                        <ApplicationStatus status={application.status} />
                      </div>
                      <div className="application-meta">
                        <span>
                          <Icon name="location" /> {application.location}
                        </span>
                        <span>
                          <Icon name="clock" /> Ứng tuyển {formatDate(application.appliedAt)}
                        </span>
                        {application.cvAttached ? (
                          <span>
                            <Icon name="paperclip" /> Đã đính kèm CV
                          </span>
                        ) : null}
                      </div>
                      <ApplicationProgress status={application.status} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="category-icon">
                  <Icon name="briefcase" />
                </span>
                <h2>Bạn chưa ứng tuyển vị trí nào</h2>
                <p>Khám phá việc làm phù hợp và gửi đơn đầu tiên của bạn.</p>
                <Link className="button button-small" href="/viec-lam">
                  Tìm việc làm
                </Link>
              </div>
            )}
          </section>

          <aside className="candidate-sidebar">
            <div className="candidate-summary-card">
              <span className="section-kicker">Tổng quan</span>
              <div className="candidate-stat-grid">
                <div>
                  <strong>{applications.length}</strong>
                  <span>Đã ứng tuyển</span>
                </div>
                <div>
                  <strong>{countByStatus("Reviewing")}</strong>
                  <span>Đang xem xét</span>
                </div>
                <div>
                  <strong>{countByStatus("Accepted")}</strong>
                  <span>Được chấp nhận</span>
                </div>
                <div>
                  <strong>{countByStatus("Rejected")}</strong>
                  <span>Chưa phù hợp</span>
                </div>
              </div>
            </div>
            <div className="candidate-tip-card">
              <span className="mini-icon coral-icon">
                <Icon name="sparkle" />
              </span>
              <h3>Tăng cơ hội được chú ý</h3>
              <p>Nhà tuyển dụng ưu tiên hồ sơ có kỹ năng được mô tả rõ và khoảng lương mong muốn hợp lý.</p>
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
            {recommendations.length > 0 ? (
              <div className="featured-grid">
                {recommendations.map((job) => (
                  <JobCard job={job} key={job.id} />
                ))}
              </div>
            ) : (
              <p className="recommendation-empty">
                Chưa có gợi ý phù hợp. Thêm kỹ năng và khoảng lương mong muốn vào{" "}
                <Link href="/ung-vien/ho-so">hồ sơ</Link> để JobBoard tìm việc đúng với bạn.
              </p>
            )}
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
