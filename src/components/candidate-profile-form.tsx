"use client";

import { type FormEvent, useState } from "react";
import { SkillInput } from "@/components/skill-input";
import { updateCandidateProfile } from "@/lib/api";
import { MAX_CANDIDATE_SKILLS, suggestedSkills } from "@/lib/job-options";
import type { CandidateProfile } from "@/types/job";

const initials = (name: string) =>
  name
    .split(" ")
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function CandidateProfileForm({ profile }: { profile: CandidateProfile }) {
  const [skills, setSkills] = useState(profile.skills);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function report(text: string, error: boolean) {
    setMessage(text);
    setIsError(error);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const salaryMin = String(form.get("desiredSalaryMin") ?? "").trim();
    const salaryMax = String(form.get("desiredSalaryMax") ?? "").trim();

    if ((salaryMin === "") !== (salaryMax === "")) {
      report("Hãy nhập đủ cả hai mức lương mong muốn, hoặc bỏ trống cả hai.", true);
      return;
    }

    if (salaryMin !== "" && Number(salaryMin) > Number(salaryMax)) {
      report("Mức lương mong muốn tối thiểu không được lớn hơn mức tối đa.", true);
      return;
    }

    setIsSaving(true);
    report("", false);

    try {
      await updateCandidateProfile(profile.id, {
        email: String(form.get("email") ?? "").trim(),
        bio: String(form.get("bio") ?? "").trim(),
        desiredSalaryMin: salaryMin === "" ? null : Number(salaryMin),
        desiredSalaryMax: salaryMax === "" ? null : Number(salaryMax),
        skills,
      });
      report("Đã lưu hồ sơ.", false);
    } catch (error) {
      report(error instanceof Error ? error.message : "Không thể lưu hồ sơ.", true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="profile-form-card" onSubmit={saveProfile}>
      <div className="profile-form-heading">
        <div className="avatar profile-avatar">{initials(profile.name)}</div>
        <div>
          <h2>Thông tin cá nhân</h2>
          <p>Thông tin rõ ràng giúp nhà tuyển dụng hiểu bạn nhanh hơn.</p>
        </div>
      </div>
      <div className="form-grid">
        <label className="form-field">
          <span>Họ và tên</span>
          <input defaultValue={profile.name} readOnly />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input name="email" defaultValue={profile.email} type="email" maxLength={320} required />
        </label>
        <label className="form-field full-field">
          <span>Giới thiệu</span>
          <textarea name="bio" defaultValue={profile.bio ?? ""} rows={5} maxLength={4000} />
        </label>
        <label className="form-field">
          <span>Mức lương mong muốn từ (USD)</span>
          <input name="desiredSalaryMin" defaultValue={profile.desiredSalaryMin ?? ""} min="0" max="1000000000" type="number" />
        </label>
        <label className="form-field">
          <span>Đến (USD)</span>
          <input name="desiredSalaryMax" defaultValue={profile.desiredSalaryMax ?? ""} min="0" max="1000000000" type="number" />
        </label>
        <div className="form-field full-field">
          <SkillInput
            label="Kỹ năng"
            value={skills}
            onChange={setSkills}
            max={MAX_CANDIDATE_SKILLS}
            suggestions={suggestedSkills}
            hint="Kỹ năng khớp với tin tuyển dụng sẽ tăng điểm phù hợp."
          />
        </div>
      </div>
      <div className="profile-form-actions">
        {message ? (
          <span className={isError ? "form-error" : undefined} role="status">
            {message}
          </span>
        ) : (
          <span />
        )}
        <button className="button" type="submit" disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu hồ sơ"}
        </button>
      </div>
    </form>
  );
}
