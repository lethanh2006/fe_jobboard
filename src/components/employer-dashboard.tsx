"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import {
  changeApplicationStatus,
  changeEmployerJobState,
  createEmployerJob,
} from "@/lib/api";
import type { ApplicationView, EmployerJob, JobApplication } from "@/types/job";

type DashboardJob = EmployerJob & {
  views: number;
};

type CandidateRow = {
  id: number;
  name: string;
  role: string;
  job: string;
  match: number;
  status: JobApplication["status"];
};

const fallbackJobs: DashboardJob[] = [
  { id: 1, title: "Backend Developer (.NET)", status: "Published", applications: 14, views: 286, deadline: "31/10/2026", postedAt: "25/09/2026" },
  { id: 2, title: "Senior Product Manager", status: "Published", applications: 8, views: 174, deadline: "05/11/2026", postedAt: "24/09/2026" },
  { id: 3, title: "QA Automation Engineer", status: "Draft", applications: 0, views: 0, deadline: "Chưa đặt", postedAt: "Hôm nay" },
  { id: 4, title: "UI Designer", status: "Closed", applications: 21, views: 412, deadline: "Đã đóng", postedAt: "12/09/2026" },
];

const initialCandidates: CandidateRow[] = [
  { id: 1, name: "Nguyễn Minh An", role: "Backend Developer", job: "Backend Developer (.NET)", match: 94, status: "Reviewing" },
  { id: 2, name: "Trần Hoàng Linh", role: "Software Engineer", job: "Backend Developer (.NET)", match: 89, status: "Submitted" },
  { id: 3, name: "Lê Thu Trang", role: "Product Owner", job: "Senior Product Manager", match: 86, status: "Reviewing" },
  { id: 4, name: "Phạm Quốc Huy", role: "Backend Engineer", job: "Backend Developer (.NET)", match: 82, status: "Submitted" },
];

const jobStatusLabels: Record<EmployerJob["status"], string> = {
  Draft: "Bản nháp",
  Published: "Đang tuyển",
  Closed: "Đã đóng",
};

const candidateStatusLabels: Record<CandidateRow["status"], string> = {
  Submitted: "Mới nhận",
  Reviewing: "Đang xem xét",
  Accepted: "Chấp nhận",
  Rejected: "Từ chối",
};

export function EmployerDashboard({
  initialEmployerJobs,
  initialApplications,
}: {
  initialEmployerJobs: EmployerJob[];
  initialApplications: ApplicationView[];
}) {
  const [activeView, setActiveView] = useState<"jobs" | "candidates">("jobs");
  const [employerJobs, setEmployerJobs] = useState<DashboardJob[]>(
    initialEmployerJobs.length > 0
      ? initialEmployerJobs.map((job) => ({ ...job, views: 0 }))
      : fallbackJobs,
  );
  const [candidates, setCandidates] = useState<CandidateRow[]>(
    initialApplications.length > 0
      ? initialApplications.map((application, index) => ({
          id: application.id,
          name: application.candidateName,
          role: "Ứng viên JobBoard",
          job: application.jobTitle,
          match: Math.max(74, 94 - index * 5),
          status: application.status,
        }))
      : initialCandidates,
  );
  const [showComposer, setShowComposer] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const stats = useMemo(
    () => ({
      activeJobs: employerJobs.filter((job) => job.status === "Published").length,
      applications: employerJobs.reduce((total, job) => total + job.applications, 0),
      reviewing: candidates.filter((candidate) => candidate.status === "Reviewing").length,
      accepted: candidates.filter((candidate) => candidate.status === "Accepted").length,
    }),
    [candidates, employerJobs],
  );

  async function changeJobState(id: number, action: "publish" | "close") {
    try {
      const updated = await changeEmployerJobState(1, id, action);
      setEmployerJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === id ? { ...job, status: updated.status } : job,
        ),
      );
      setActionMessage(action === "close" ? "Đã đóng tin tuyển dụng." : "Đã đăng tin tuyển dụng.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Không thể cập nhật tin.");
    }
  }

  async function updateCandidateStatus(id: number, status: CandidateRow["status"]) {
    try {
      await changeApplicationStatus(1, id, status);
      setCandidates((currentCandidates) =>
        currentCandidates.map((candidate) =>
          candidate.id === id ? { ...candidate, status } : candidate,
        ),
      );
      setActionMessage("Đã cập nhật trạng thái ứng viên.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Không thể cập nhật ứng viên.");
    }
  }

  async function addDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const deadline = String(form.get("deadline") ?? "").trim();

    if (!title) {
      return;
    }

    try {
      const job = await createEmployerJob(1, {
        title,
        deadline,
        location: "TP. Hồ Chí Minh",
        salaryMin: 1500,
        salaryMax: 2500,
      });
      setEmployerJobs((currentJobs) => [{ ...job, views: 0 }, ...currentJobs]);
      event.currentTarget.reset();
      setShowComposer(false);
      setActionMessage("Đã lưu bản nháp trên backend.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Không thể tạo bản nháp.");
    }
  }

  return (
    <>
      <section className="employer-welcome">
        <div>
          <span className="section-kicker">Nova Technology</span>
          <h1>Chào buổi sáng, Trần Bình</h1>
          <p>Đây là tình hình tuyển dụng của đội ngũ trong tuần này.</p>
        </div>
        <button className="button" type="button" onClick={() => setShowComposer((visible) => !visible)}>
          <span className="button-plus">+</span> Đăng tin mới
        </button>
      </section>

      {showComposer ? (
        <form className="job-composer" onSubmit={addDraft}>
          <div>
            <span className="section-kicker">Tin tuyển dụng mới</span>
            <h2>Tạo nhanh bản nháp</h2>
          </div>
          <label>
            <span>Chức danh</span>
            <input name="title" required placeholder="Ví dụ: Senior Backend Developer" />
          </label>
          <label>
            <span>Hạn ứng tuyển</span>
            <input name="deadline" type="date" required />
          </label>
          <div className="composer-actions">
            <button className="text-button" type="button" onClick={() => setShowComposer(false)}>
              Hủy
            </button>
            <button className="button button-small" type="submit">
              Lưu bản nháp
            </button>
          </div>
        </form>
      ) : null}

      <section className="employer-stats">
        <DashboardStat icon="briefcase" label="Tin đang tuyển" value={stats.activeJobs} tone="mint" />
        <DashboardStat icon="users" label="Tổng ứng viên" value={stats.applications} tone="sky" />
        <DashboardStat icon="clock" label="Đang xem xét" value={stats.reviewing} tone="amber" />
        <DashboardStat icon="check" label="Đã chấp nhận" value={stats.accepted} tone="coral" />
      </section>

      {actionMessage ? <p className="dashboard-message" role="status">{actionMessage}</p> : null}

      <section className="management-card">
        <div className="management-tabs">
          <div>
            <button
              className={activeView === "jobs" ? "active" : ""}
              type="button"
              onClick={() => setActiveView("jobs")}
            >
              Tin tuyển dụng
            </button>
            <button
              className={activeView === "candidates" ? "active" : ""}
              type="button"
              onClick={() => setActiveView("candidates")}
            >
              Ứng viên gần đây
            </button>
          </div>
          <span>Cập nhật tức thì trên bản demo</span>
        </div>

        {activeView === "jobs" ? (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Vị trí</th>
                  <th>Trạng thái</th>
                  <th>Ứng viên</th>
                  <th>Lượt xem</th>
                  <th>Hạn tuyển</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {employerJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <span>Mã tin #{String(job.id).padStart(3, "0")}</span>
                    </td>
                    <td>
                      <span className={`job-state job-state-${job.status.toLowerCase()}`}>
                        {jobStatusLabels[job.status]}
                      </span>
                    </td>
                    <td>{job.applications}</td>
                    <td>{job.views}</td>
                    <td>{job.deadline}</td>
                    <td>
                      {job.status === "Published" ? (
                        <button className="table-action" type="button" onClick={() => changeJobState(job.id, "close")}>
                          Đóng tin
                        </button>
                      ) : job.status === "Draft" ? (
                        <button className="table-action publish-action" type="button" onClick={() => changeJobState(job.id, "publish")}>
                          Đăng tin
                        </button>
                      ) : (
                        <span className="muted-action">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Ứng viên</th>
                  <th>Ứng tuyển vị trí</th>
                  <th>Phù hợp</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <div className="candidate-cell">
                        <span className="avatar small-avatar">
                          {candidate.name
                            .split(" ")
                            .slice(-2)
                            .map((part) => part[0])
                            .join("")}
                        </span>
                        <div>
                          <strong>{candidate.name}</strong>
                          <span>{candidate.role}</span>
                        </div>
                      </div>
                    </td>
                    <td>{candidate.job}</td>
                    <td>
                      <span className="match-pill">{candidate.match}%</span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={candidate.status}
                        onChange={(event) =>
                          void updateCandidateStatus(candidate.id, event.target.value as CandidateRow["status"])
                        }
                      >
                        {Object.entries(candidateStatusLabels).map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function DashboardStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: "briefcase" | "users" | "clock" | "check";
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article className="dashboard-stat">
      <span className={`stat-icon stat-${tone}`}>
        <Icon name={icon} />
      </span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
