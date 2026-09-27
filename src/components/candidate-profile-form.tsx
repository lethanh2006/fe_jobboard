"use client";

import { type FormEvent, useState } from "react";

const skillOptions = ["C#", "ASP.NET Core", "PostgreSQL", "Docker", "TypeScript", "React"];

export function CandidateProfileForm() {
  const [saved, setSaved] = useState(false);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
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
          <input defaultValue="Nguyễn Minh An" required />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input defaultValue="an@example.com" type="email" required />
        </label>
        <label className="form-field full-field">
          <span>Giới thiệu</span>
          <textarea
            defaultValue="Backend Developer yêu thích sản phẩm có tác động thực tế và những hệ thống được thiết kế chỉn chu."
            rows={5}
          />
        </label>
        <label className="form-field">
          <span>Mức lương mong muốn từ (USD)</span>
          <input defaultValue="1800" min="0" type="number" />
        </label>
        <label className="form-field">
          <span>Đến (USD)</span>
          <input defaultValue="2800" min="0" type="number" />
        </label>
        <fieldset className="skill-picker full-field">
          <legend>Kỹ năng</legend>
          <div>
            {skillOptions.map((skill, index) => (
              <label key={skill}>
                <input defaultChecked={index < 4} type="checkbox" />
                {skill}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="profile-form-actions">
        {saved ? <span>Đã lưu thay đổi trên bản demo.</span> : <span />}
        <button className="button" type="submit">
          Lưu hồ sơ
        </button>
      </div>
    </form>
  );
}
