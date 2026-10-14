"use client";

import { useEffect, useState } from "react";
import { getApplicantDetail } from "@/lib/api";
import { formatDate, formatSalary } from "@/lib/format";
import type { ApplicantDetail, JobApplication } from "@/types/job";

const statusOptions: { value: JobApplication["status"]; label: string }[] = [
  { value: "Submitted", label: "Mới nhận" },
  { value: "Reviewing", label: "Đang xem xét" },
  { value: "Accepted", label: "Chấp nhận" },
  { value: "Rejected", label: "Từ chối" },
];

type ApplicantDrawerProps = {
  companyId: number;
  applicationId: number;
  /** Trạng thái hiện tại ở danh sách (có thể mới hơn dữ liệu vừa tải). */
  status: JobApplication["status"];
  onStatusChange: (status: JobApplication["status"]) => void;
  onClose: () => void;
};

export function ApplicantDrawer({
  companyId,
  applicationId,
  status,
  onStatusChange,
  onClose,
}: ApplicantDrawerProps) {
  const [detail, setDetail] = useState<ApplicantDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getApplicantDetail(companyId, applicationId)
      .then((result) => !cancelled && setDetail(result))
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, companyId]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const candidate = detail?.candidate;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Hồ sơ ứng viên"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <span className="section-kicker">Hồ sơ ứng viên</span>
          <button type="button" className="drawer-close" aria-label="Đóng" onClick={onClose}>
            ×
          </button>
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {!detail && !error ? <p className="drawer-loading">Đang tải hồ sơ...</p> : null}

        {detail && candidate ? (
          <div className="drawer-body">
            <div className="drawer-identity">
              <span className="avatar profile-avatar">
                {candidate.name.split(" ").slice(-2).map((part) => part[0]).join("")}
              </span>
              <div>
                <h2>{candidate.name}</h2>
                <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
              </div>
            </div>

            <div className="drawer-match">
              <div className="match-ring" style={{ ["--score" as string]: detail.application.matchScore }}>
                <strong>{detail.application.matchScore}%</strong>
              </div>
              <div>
                <strong>Độ phù hợp với “{detail.application.jobTitle}”</strong>
                <span>
                  {detail.matchedSkills.length}/{detail.matchedSkills.length + detail.missingSkills.length} kỹ năng yêu cầu ·{" "}
                  {detail.salaryFit ? "lương mong muốn phù hợp" : "lương mong muốn lệch khung"}
                </span>
              </div>
            </div>

            <section>
              <h3>Giới thiệu</h3>
              <p className="drawer-text">{candidate.bio?.trim() || "Ứng viên chưa viết phần giới thiệu."}</p>
            </section>

            <section>
              <h3>Mức lương mong muốn</h3>
              <p className="drawer-text">
                {candidate.desiredSalaryMin !== null && candidate.desiredSalaryMax !== null
                  ? formatSalary(candidate.desiredSalaryMin, candidate.desiredSalaryMax)
                  : "Chưa cung cấp"}
              </p>
            </section>

            <section>
              <h3>Kỹ năng</h3>
              <div className="skill-list drawer-skills">
                {detail.matchedSkills.map((skill) => (
                  <span className="skill-tag skill-match" key={skill} title="Khớp yêu cầu của tin">
                    ✓ {skill}
                  </span>
                ))}
                {detail.missingSkills.map((skill) => (
                  <span className="skill-tag skill-missing" key={skill} title="Tin yêu cầu nhưng ứng viên chưa có">
                    {skill}
                  </span>
                ))}
                {candidate.skills
                  .filter((skill) => !detail.matchedSkills.some((item) => item.toLowerCase() === skill.toLowerCase()))
                  .map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
              </div>
              {detail.missingSkills.length > 0 ? (
                <small className="drawer-legend">Nét đứt: kỹ năng tin yêu cầu mà ứng viên chưa có.</small>
              ) : null}
            </section>

            <section className="drawer-application">
              <div>
                <h3>Đơn ứng tuyển</h3>
                <p className="drawer-text">
                  Nộp ngày {formatDate(detail.application.appliedAt)}
                </p>
              </div>
              <label>
                <span className="sr-only">Cập nhật trạng thái</span>
                <select
                  className="status-select"
                  value={status}
                  onChange={(event) => onStatusChange(event.target.value as JobApplication["status"])}
                >
                  {statusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
