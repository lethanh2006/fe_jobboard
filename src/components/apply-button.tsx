"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { ApiError, applyToJob } from "@/lib/api";

type ApplyButtonProps = {
  jobId: number;
  fullWidth?: boolean;
  /** Lý do không thể ứng tuyển (tin đã đóng, hết hạn, không phải ứng viên...). */
  unavailableReason?: string;
  /** Ứng viên đã nộp đơn vào tin này trước đó. */
  alreadyApplied?: boolean;
};

export function ApplyButton({
  jobId,
  fullWidth = false,
  unavailableReason,
  alreadyApplied = false,
}: ApplyButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    alreadyApplied ? "success" : "idle",
  );
  const [message, setMessage] = useState("");

  async function apply() {
    setState("loading");
    setMessage("");

    try {
      await applyToJob(jobId);
      setState("success");
      setMessage("Ứng tuyển thành công. Bạn có thể theo dõi đơn trong khu vực ứng viên.");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`/dang-nhap?redirect=${encodeURIComponent(`/viec-lam/${jobId}`)}`);
        return;
      }

      setState("error");
      setMessage(error instanceof Error ? error.message : "Không thể ứng tuyển lúc này.");
    }
  }

  const className = fullWidth ? "apply-action apply-action-full" : "apply-action";
  const buttonClass = `button ${fullWidth ? "full-button" : "hero-apply-button"}`;

  if (unavailableReason) {
    return (
      <div className={className}>
        <button className={buttonClass} type="button" disabled>
          {unavailableReason}
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        className={buttonClass}
        type="button"
        disabled={state === "loading" || state === "success"}
        onClick={apply}
      >
        {state === "loading"
          ? "Đang gửi..."
          : state === "success"
            ? "Đã ứng tuyển"
            : "Ứng tuyển ngay"}
        {state === "success" ? <Icon name="check" /> : <Icon name="arrow" />}
      </button>
      {state === "success" && alreadyApplied && !message ? (
        <p className="apply-feedback apply-feedback-success">
          Bạn đã ứng tuyển tin này.{" "}
          <Link href="/ung-vien/don-ung-tuyen">Xem đơn của tôi</Link>
        </p>
      ) : null}
      {message ? (
        <p className={`apply-feedback apply-feedback-${state}`} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
