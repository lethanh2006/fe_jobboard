"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cvDownloadUrl, deleteCv, uploadCv } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/format";
import type { CvInfo } from "@/types/job";

const maxBytes = 5 * 1024 * 1024;
const allowedExtensions = [".pdf", ".doc", ".docx"];

const typeLabels: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

export function CandidateCvCard({ candidateId, cv }: { candidateId: number; cv: CvInfo | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(cv);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  function report(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Cho phép chọn lại đúng tệp đó lần sau (trình duyệt không phát change nếu giá trị không đổi).
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!allowedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension))) {
      report("CV phải là tệp PDF, DOC hoặc DOCX.", true);
      return;
    }
    if (file.size > maxBytes) {
      report("CV không được lớn hơn 5 MB.", true);
      return;
    }

    setIsBusy(true);
    report("");
    try {
      setCurrent(await uploadCv(candidateId, file));
      report("Đã tải CV lên. CV này sẽ được gửi kèm các đơn ứng tuyển tiếp theo của bạn.");
    } catch (error) {
      report(error instanceof Error ? error.message : "Không thể tải CV lên.", true);
    } finally {
      setIsBusy(false);
    }
  }

  async function removeCv() {
    if (!window.confirm("Xóa CV hiện tại? Các đơn đã nộp vẫn giữ CV đã gửi.")) {
      return;
    }

    setIsBusy(true);
    report("");
    try {
      await deleteCv(candidateId);
      setCurrent(null);
      report("Đã xóa CV.");
    } catch (error) {
      report(error instanceof Error ? error.message : "Không thể xóa CV.", true);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="profile-form-card cv-card" aria-labelledby="cv-heading">
      <div className="cv-heading">
        <div>
          <h2 id="cv-heading">CV của bạn</h2>
          <p>CV hiện tại được đính kèm khi bạn ứng tuyển. PDF, DOC hoặc DOCX, tối đa 5 MB.</p>
        </div>
      </div>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        aria-label="Chọn tệp CV"
        onChange={chooseFile}
        disabled={isBusy}
      />

      {current ? (
        <div className="cv-file">
          <span className="cv-file-icon">
            <Icon name="paperclip" />
          </span>
          <div className="cv-file-info">
            <a href={cvDownloadUrl(candidateId)} download>
              {current.fileName}
            </a>
            <span>
              {typeLabels[current.contentType] ?? "Tệp"} · {formatFileSize(current.sizeBytes)} · tải lên{" "}
              {formatDate(current.uploadedAt.slice(0, 10))}
            </span>
          </div>
          <div className="cv-actions">
            <button
              className="text-button"
              type="button"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
            >
              Thay CV
            </button>
            <button className="table-action" type="button" disabled={isBusy} onClick={removeCv}>
              Xóa
            </button>
          </div>
        </div>
      ) : (
        <div className="cv-empty">
          <p>Bạn chưa tải CV. Nhà tuyển dụng sẽ thấy hồ sơ đầy đủ hơn khi có CV đính kèm.</p>
          <button
            className="button button-small"
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            {isBusy ? "Đang tải lên..." : "Tải CV lên"}
          </button>
        </div>
      )}

      {message ? (
        <p className={isError ? "form-error" : "cv-message"} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
