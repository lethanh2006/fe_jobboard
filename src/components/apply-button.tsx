"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { applyToJob } from "@/lib/api";

export function ApplyButton({
  jobId,
  fullWidth = false,
}: {
  jobId: number;
  fullWidth?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function apply() {
    setState("loading");
    setMessage("");

    try {
      await applyToJob(20, jobId);
      setState("success");
      setMessage("Ứng tuyển thành công. Bạn có thể theo dõi đơn trong khu vực ứng viên.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Không thể ứng tuyển lúc này.");
    }
  }

  return (
    <div className={fullWidth ? "apply-action apply-action-full" : "apply-action"}>
      <button
        className={`button ${fullWidth ? "full-button" : "hero-apply-button"}`}
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
      {message ? (
        <p className={`apply-feedback apply-feedback-${state}`} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
