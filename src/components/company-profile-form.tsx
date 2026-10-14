"use client";

import { type FormEvent, useState } from "react";
import { updateCompany } from "@/lib/api";
import type { CompanyProfile } from "@/types/job";

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function CompanyProfileForm({
  company,
  saved = false,
}: {
  company: CompanyProfile;
  /** Trang vừa tải lại sau khi lưu (để làm mới tên công ty trong phiên đăng nhập). */
  saved?: boolean;
}) {
  const [message, setMessage] = useState(saved ? "Đã lưu hồ sơ công ty." : "");
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    setIsSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const updated = await updateCompany(company.id, {
        name: field("name"),
        location: field("location") || null,
        website: field("website") || null,
        description: field("description") || null,
      });

      if (updated.name !== company.name) {
        // Tên công ty nằm trong phiên đăng nhập: làm mới phiên rồi quay lại trang này.
        // Đích là route handler (đặt cookie rồi chuyển hướng) chứ không phải trang, nên cần điều hướng cả trang.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/api/auth/refresh?redirect=%2Fnha-tuyen-dung%2Fcong-ty%3Fsaved%3D1";
        return;
      }

      setMessage("Đã lưu hồ sơ công ty.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu hồ sơ công ty.");
      setIsError(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="profile-form-card" onSubmit={save}>
      <div className="profile-form-heading">
        <div className="avatar profile-avatar">{initials(company.name)}</div>
        <div>
          <h2>Thông tin công ty</h2>
          <p>Ứng viên sẽ thấy thông tin này trên trang công ty và trong từng tin tuyển dụng.</p>
        </div>
      </div>
      <div className="form-grid">
        <label className="form-field full-field">
          <span>Tên công ty</span>
          <input name="name" defaultValue={company.name} required maxLength={200} />
        </label>
        <label className="form-field">
          <span>Địa điểm</span>
          <input name="location" defaultValue={company.location ?? ""} maxLength={200} placeholder="TP. Hồ Chí Minh" />
        </label>
        <label className="form-field">
          <span>Website</span>
          <input
            name="website"
            type="url"
            defaultValue={company.website ?? ""}
            maxLength={300}
            placeholder="https://congty.vn"
          />
        </label>
        <label className="form-field full-field">
          <span>Giới thiệu công ty</span>
          <textarea name="description" rows={7} maxLength={4000} defaultValue={company.description ?? ""} />
        </label>
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
          {isSaving ? "Đang lưu..." : "Lưu hồ sơ công ty"}
        </button>
      </div>
    </form>
  );
}
