"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

type ReasonDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** Ném lỗi để giữ hộp thoại mở và hiển thị thông báo. */
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
};

/** Hộp thoại xác nhận bắt buộc nhập lý do (gỡ tin, khóa công ty). */
export function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ReasonDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("reason") ?? "").trim();
    setIsSubmitting(true);
    setError("");

    try {
      await onConfirm(reason);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể thực hiện.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="reason-dialog" onClose={onCancel}>
      <form onSubmit={submit}>
        <h2>{title}</h2>
        <p>{description}</p>
        <label className="form-field">
          <span>Lý do</span>
          <textarea name="reason" rows={4} required maxLength={500} autoFocus />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="reason-dialog-actions">
          <button className="text-button" type="button" onClick={onCancel}>
            Hủy
          </button>
          <button className="button button-small button-danger" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
