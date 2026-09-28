"use client";

import { type FormEvent, useState } from "react";
import { updateCandidateProfile } from "@/lib/api";
import type { CandidateProfile } from "@/types/job";

const skillOptions = ["C#", "ASP.NET Core", "PostgreSQL", "Docker", "TypeScript", "React"];

export function CandidateProfileForm({ profile }: { profile: CandidateProfile }) {
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      await updateCandidateProfile(profile.id, {
        email: String(form.get("email") ?? ""),
        bio: String(form.get("bio") ?? ""),
        desiredSalaryMin: Number(form.get("desiredSalaryMin")),
        desiredSalaryMax: Number(form.get("desiredSalaryMax")),
        skills: form.getAll("skills").map(String),
      });
      setMessage("Đã lưu hồ sơ trên backend.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="profile-form-card" onSubmit={saveProfile}>
      <div className="profile-form-heading">
        <div className="avatar profile-avatar">AN</div>
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
          <input name="email" defaultValue={profile.email} type="email" required />
        </label>
        <label className="form-field full-field">
          <span>Giới thiệu</span>
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={5}
          />
        </label>
        <label className="form-field">
          <span>Mức lương mong muốn từ (USD)</span>
          <input name="desiredSalaryMin" defaultValue={profile.desiredSalaryMin ?? ""} min="0" type="number" required />
        </label>
        <label className="form-field">
          <span>Đến (USD)</span>
          <input name="desiredSalaryMax" defaultValue={profile.desiredSalaryMax ?? ""} min="0" type="number" required />
        </label>
        <fieldset className="skill-picker full-field">
          <legend>Kỹ năng</legend>
          <div>
            {skillOptions.map((skill) => (
              <label key={skill}>
                <input
                  name="skills"
                  value={skill}
                  defaultChecked={profile.skills.includes(skill)}
                  type="checkbox"
                />
                {skill}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="profile-form-actions">
        {message ? <span>{message}</span> : <span />}
        <button className="button" type="submit" disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu hồ sơ"}
        </button>
      </div>
    </form>
  );
}
