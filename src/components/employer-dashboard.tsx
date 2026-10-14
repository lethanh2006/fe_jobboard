"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ApplicantDrawer } from "@/components/applicant-drawer";
import { EmployerJobForm } from "@/components/employer-job-form";
import { Icon } from "@/components/icon";
import {
  changeApplicationStatus,
  changeEmployerJobState,
  createEmployerJob,
  getEmployerJobDetail,
  updateEmployerJob,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import type {
  ApplicationView,
  EmployerJob,
  EmployerJobDetail,
  JobApplication,
  JobFormInput,
} from "@/types/job";

type Editor = { mode: "closed" } | { mode: "create" } | { mode: "edit"; job: EmployerJobDetail };

const jobStatusLabels: Record<EmployerJob["status"], string> = {
  Draft: "Bản nháp",
  Published: "Đang tuyển",
  Closed: "Đã đóng",
  Removed: "Bị gỡ",
};

const candidateStatusLabels: Record<JobApplication["status"], string> = {
  Submitted: "Mới nhận",
  Reviewing: "Đang xem xét",
  Accepted: "Chấp nhận",
  Rejected: "Từ chối",
};

export function EmployerDashboard({
  companyId,
  companyName,
  employerName,
  initialEmployerJobs,
  initialApplications,
  initialView = "jobs",
  initialApplicationId = null,
}: {
  companyId: number;
  companyName: string;
  employerName: string;
  initialEmployerJobs: EmployerJob[];
  initialApplications: ApplicationView[];
  initialView?: "jobs" | "candidates";
  initialApplicationId?: number | null;
}) {
  const [activeView, setActiveView] = useState<"jobs" | "candidates">(initialView);
  const [employerJobs, setEmployerJobs] = useState(initialEmployerJobs);
  const [applications, setApplications] = useState(initialApplications);
  const [editor, setEditor] = useState<Editor>({ mode: "closed" });
  const [actionMessage, setActionMessage] = useState("");
  const [jobFilter, setJobFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState<JobApplication["status"] | "all">("all");
  const [sortBy, setSortBy] = useState<"match" | "newest">("match");
  const [openApplicationId, setOpenApplicationId] = useState<number | null>(initialApplicationId);

  const stats = useMemo(
    () => ({
      activeJobs: employerJobs.filter((job) => job.status === "Published").length,
      applications: employerJobs.reduce((total, job) => total + job.applications, 0),
      reviewing: applications.filter((application) => application.status === "Reviewing").length,
      accepted: applications.filter((application) => application.status === "Accepted").length,
    }),
    [applications, employerJobs],
  );

  const visibleApplications = useMemo(
    () =>
      applications
        .filter(
          (application) =>
            (jobFilter === 0 || application.jobId === jobFilter) &&
            (statusFilter === "all" || application.status === statusFilter),
        )
        .sort((first, second) =>
          sortBy === "match"
            ? (second.matchScore ?? 0) - (first.matchScore ?? 0) || second.id - first.id
            : second.appliedAt.localeCompare(first.appliedAt) || second.id - first.id,
        ),
    [applications, jobFilter, sortBy, statusFilter],
  );

  function reportError(error: unknown, fallback: string) {
    setActionMessage(error instanceof Error ? error.message : fallback);
  }

  async function changeJobState(id: number, action: "publish" | "close") {
    try {
      const updated = await changeEmployerJobState(companyId, id, action);
      setEmployerJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === id ? { ...job, status: updated.status } : job)),
      );
      setActionMessage(action === "close" ? "Đã đóng tin tuyển dụng." : "Đã đăng tin tuyển dụng.");
    } catch (error) {
      reportError(error, "Không thể cập nhật tin.");
    }
  }

  async function openEditor(jobId: number) {
    try {
      setEditor({ mode: "edit", job: await getEmployerJobDetail(companyId, jobId) });
      setActionMessage("");
    } catch (error) {
      reportError(error, "Không thể tải nội dung tin.");
    }
  }

  async function saveJob(input: JobFormInput) {
    if (editor.mode === "edit") {
      const updated = await updateEmployerJob(companyId, editor.job.id, input);
      setEmployerJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === updated.id
            ? { ...job, title: updated.title, deadline: updated.deadline }
            : job,
        ),
      );
      setActionMessage("Đã lưu thay đổi của tin tuyển dụng.");
    } else {
      const created = await createEmployerJob(companyId, input);
      setEmployerJobs((currentJobs) => [created, ...currentJobs]);
      setActionMessage("Đã lưu bản nháp. Bấm “Đăng tin” để hiển thị cho ứng viên.");
    }

    setEditor({ mode: "closed" });
  }

  async function updateCandidateStatus(id: number, status: JobApplication["status"]) {
    try {
      await changeApplicationStatus(id, status);
      setApplications((current) =>
        current.map((application) => (application.id === id ? { ...application, status } : application)),
      );
      setActionMessage("Đã cập nhật trạng thái ứng viên.");
    } catch (error) {
      reportError(error, "Không thể cập nhật ứng viên.");
    }
  }

  const openApplication = applications.find((application) => application.id === openApplicationId);

  return (
    <>
      <section className="employer-welcome">
        <div>
          <span className="section-kicker">{companyName}</span>
          <h1>Chào buổi sáng, {employerName}</h1>
          <p>
            Đây là tình hình tuyển dụng của đội ngũ.{" "}
            <Link className="inline-link" href="/nha-tuyen-dung/cong-ty">
              Chỉnh sửa hồ sơ công ty →
            </Link>
          </p>
        </div>
        <button
          className="button"
          type="button"
          onClick={() => {
            setEditor(editor.mode === "create" ? { mode: "closed" } : { mode: "create" });
            setActionMessage("");
          }}
        >
          <span className="button-plus">+</span> Đăng tin mới
        </button>
      </section>

      {editor.mode !== "closed" ? (
        <EmployerJobForm
          key={editor.mode === "edit" ? editor.job.id : "new"}
          initial={editor.mode === "edit" ? editor.job : undefined}
          onSubmit={saveJob}
          onCancel={() => setEditor({ mode: "closed" })}
        />
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
              Ứng viên
            </button>
          </div>
          <span>
            {activeView === "jobs"
              ? `${employerJobs.length} tin`
              : `${visibleApplications.length}/${applications.length} đơn ứng tuyển`}
          </span>
        </div>

        {activeView === "jobs" ? (
          employerJobs.length > 0 ? (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Vị trí</th>
                    <th>Trạng thái</th>
                    <th>Ứng viên</th>
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
                        {job.status === "Removed" ? (
                          <span className="removal-reason">
                            Bị gỡ: {job.removalReason ?? "vi phạm điều khoản"}. Liên hệ quản trị viên
                            để được xem xét lại.
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <span className={`job-state job-state-${job.status.toLowerCase()}`}>
                          {jobStatusLabels[job.status]}
                        </span>
                      </td>
                      <td>
                        {job.applications > 0 ? (
                          <button
                            className="table-link"
                            type="button"
                            onClick={() => {
                              setJobFilter(job.id);
                              setActiveView("candidates");
                            }}
                          >
                            {job.applications} đơn
                          </button>
                        ) : (
                          0
                        )}
                      </td>
                      <td>{formatDate(job.deadline)}</td>
                      <td>
                        <div className="row-actions">
                          {job.status === "Draft" || job.status === "Published" ? (
                            <button className="table-action table-action-neutral" type="button" onClick={() => openEditor(job.id)}>
                              Sửa
                            </button>
                          ) : null}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="table-empty">Công ty chưa có tin nào. Bấm “Đăng tin mới” để bắt đầu.</p>
          )
        ) : (
          <>
            <div className="table-toolbar">
              <label>
                <span>Tin tuyển dụng</span>
                <select value={jobFilter} onChange={(event) => setJobFilter(Number(event.target.value))}>
                  <option value={0}>Tất cả tin</option>
                  {employerJobs.map((job) => (
                    <option value={job.id} key={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as JobApplication["status"] | "all")}
                >
                  <option value="all">Tất cả</option>
                  {Object.entries(candidateStatusLabels).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Sắp xếp</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "match" | "newest")}>
                  <option value="match">Phù hợp nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </label>
            </div>
            {visibleApplications.length > 0 ? (
              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Ứng viên</th>
                      <th>Ứng tuyển vị trí</th>
                      <th>Phù hợp</th>
                      <th>Ngày nộp</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleApplications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <div className="candidate-cell">
                            <span className="avatar small-avatar">
                              {application.candidateName
                                .split(" ")
                                .slice(-2)
                                .map((part) => part[0])
                                .join("")}
                            </span>
                            <div>
                              <button className="candidate-name-button" type="button" onClick={() => setOpenApplicationId(application.id)}>
                                {application.candidateName}
                              </button>
                              <span className="applicant-hint">
                                Xem hồ sơ
                                {application.cvAttached ? (
                                  <span className="cv-chip" title="Ứng viên có đính kèm CV">
                                    <Icon name="paperclip" /> CV
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{application.jobTitle}</td>
                        <td>
                          <span className="match-pill">{application.matchScore ?? 0}%</span>
                        </td>
                        <td>{formatDate(application.appliedAt)}</td>
                        <td>
                          <select
                            className="status-select"
                            aria-label={`Trạng thái đơn của ${application.candidateName}`}
                            value={application.status}
                            onChange={(event) =>
                              void updateCandidateStatus(application.id, event.target.value as JobApplication["status"])
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
            ) : (
              <p className="table-empty">
                {applications.length === 0
                  ? "Chưa có ứng viên nào ứng tuyển."
                  : "Không có đơn nào khớp bộ lọc hiện tại."}
              </p>
            )}
          </>
        )}
      </section>

      {openApplication ? (
        <ApplicantDrawer
          companyId={companyId}
          applicationId={openApplication.id}
          status={openApplication.status}
          onStatusChange={(status) => void updateCandidateStatus(openApplication.id, status)}
          onClose={() => setOpenApplicationId(null)}
        />
      ) : null}
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
