"use client";

import { type FormEvent, useState } from "react";
import { SkillInput } from "@/components/skill-input";
import {
  jobCategories,
  jobLevelOptions,
  MAX_JOB_SKILLS,
  suggestedSkills,
  workModeOptions,
} from "@/lib/job-options";
import type { EmployerJobDetail, JobFormInput } from "@/types/job";

type JobFormProps = {
  /** Có `initial` nghĩa là đang sửa một tin. */
  initial?: EmployerJobDetail;
  onSubmit: (input: JobFormInput) => Promise<void>;
  onCancel: () => void;
};

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function tomorrow() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

export function EmployerJobForm({ initial, onSubmit, onCancel }: JobFormProps) {
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const categories =
    initial && !jobCategories.includes(initial.category) && initial.category
      ? [initial.category, ...jobCategories]
      : jobCategories;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const salaryMin = Number(form.get("salaryMin"));
    const salaryMax = Number(form.get("salaryMax"));

    if (salaryMin > salaryMax) {
      setError("Mức lương tối thiểu không được lớn hơn mức lương tối đa.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        title: text("title"),
        location: text("location"),
        salaryMin,
        salaryMax,
        deadline: text("deadline"),
        level: text("level") as JobFormInput["level"],
        workMode: text("workMode") as JobFormInput["workMode"],
        category: text("category"),
        summary: text("summary"),
        description: toLines(text("description")),
        requirements: toLines(text("requirements")),
        benefits: toLines(text("benefits")),
        skills,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể lưu tin.");
      setIsSaving(false);
    }
  }

  return (
    <form className="job-form-card" onSubmit={submit}>
      <div className="job-form-heading">
        <div>
          <span className="section-kicker">{initial ? `Mã tin #${String(initial.id).padStart(3, "0")}` : "Tin tuyển dụng mới"}</span>
          <h2>{initial ? "Chỉnh sửa tin tuyển dụng" : "Soạn tin tuyển dụng"}</h2>
        </div>
        <span className={`job-state job-state-${(initial?.status ?? "Draft").toLowerCase()}`}>
          {initial?.status === "Published" ? "Đang tuyển" : "Bản nháp"}
        </span>
      </div>

      <div className="form-grid">
        <label className="form-field full-field">
          <span>Chức danh</span>
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={initial?.title}
            placeholder="Ví dụ: Senior Backend Developer"
          />
        </label>
        <label className="form-field">
          <span>Lĩnh vực</span>
          <select name="category" required defaultValue={initial?.category ?? jobCategories[0]}>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Địa điểm</span>
          <input
            name="location"
            required
            maxLength={200}
            defaultValue={initial?.location}
            placeholder="TP. Hồ Chí Minh"
          />
        </label>
        <label className="form-field">
          <span>Cấp bậc</span>
          <select name="level" defaultValue={initial?.level ?? "Middle"}>
            {jobLevelOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Hình thức làm việc</span>
          <select name="workMode" defaultValue={initial?.workMode ?? "Hybrid"}>
            {workModeOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Lương tối thiểu (USD)</span>
          <input name="salaryMin" type="number" min="0" max="1000000000" required defaultValue={initial?.salaryMin ?? 1500} />
        </label>
        <label className="form-field">
          <span>Lương tối đa (USD)</span>
          <input name="salaryMax" type="number" min="0" max="1000000000" required defaultValue={initial?.salaryMax ?? 2500} />
        </label>
        <label className="form-field">
          <span>Hạn nộp hồ sơ</span>
          <input
            name="deadline"
            type="date"
            required
            defaultValue={initial?.deadline}
            min={initial ? undefined : tomorrow()}
          />
        </label>
        <div className="form-field">
          <SkillInput
            label="Kỹ năng yêu cầu"
            value={skills}
            onChange={setSkills}
            max={MAX_JOB_SKILLS}
            suggestions={suggestedSkills}
          />
        </div>
        <label className="form-field full-field">
          <span>Tóm tắt</span>
          <textarea name="summary" rows={2} maxLength={2000} defaultValue={initial?.summary} placeholder="Một hai câu giới thiệu vị trí" />
        </label>
        <label className="form-field full-field">
          <span>Mô tả công việc <em className="field-hint">(mỗi dòng một ý)</em></span>
          <textarea name="description" rows={4} defaultValue={initial?.description.join("\n")} />
        </label>
        <label className="form-field">
          <span>Yêu cầu <em className="field-hint">(mỗi dòng một ý)</em></span>
          <textarea name="requirements" rows={5} defaultValue={initial?.requirements.join("\n")} />
        </label>
        <label className="form-field">
          <span>Quyền lợi <em className="field-hint">(mỗi dòng một ý)</em></span>
          <textarea name="benefits" rows={5} defaultValue={initial?.benefits.join("\n")} />
        </label>
      </div>

      <div className="profile-form-actions">
        {error ? <span className="form-error" role="alert">{error}</span> : <span />}
        <div className="composer-actions">
          <button className="text-button" type="button" onClick={onCancel}>
            Hủy
          </button>
          <button className="button button-small" type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Lưu bản nháp"}
          </button>
        </div>
      </div>
    </form>
  );
}
