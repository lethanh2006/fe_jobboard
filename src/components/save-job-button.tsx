"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { ApiError, getSavedJobIds, setJobSaved } from "@/lib/api";

export function SaveJobButton({
  jobId,
  initialSaved,
  returnPath,
  guest = false,
  available = true,
  afterRemovePath,
}: {
  jobId: number;
  initialSaved: boolean | null;
  returnPath: string;
  guest?: boolean;
  available?: boolean;
  afterRemovePath?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const busy = useRef(false);
  const loginPath = `/dang-nhap?redirect=${encodeURIComponent(returnPath)}`;

  async function toggle() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage("");
    try {
      if (saved === null) {
        setSaved((await getSavedJobIds([jobId])).includes(jobId));
        return;
      }
      await setJobSaved(jobId, !saved);
      setSaved(!saved);
      if (saved && afterRemovePath) router.replace(afterRemovePath, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.push(loginPath);
      else
        setMessage(error instanceof Error ? error.message : "Không thể cập nhật việc làm đã lưu.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (guest) {
    return available ? (
      <Link className="save-job-button" href={loginPath}>
        <Icon name="bookmark" />
        Lưu việc làm
      </Link>
    ) : null;
  }
  return (
    <div className="save-job-action">
      <button
        className={`save-job-button${saved ? " is-saved" : ""}`}
        type="button"
        aria-pressed={saved ?? undefined}
        disabled={pending || (saved === false && !available)}
        onClick={toggle}
        title={saved === false && !available ? "Tin không còn nhận hồ sơ" : undefined}
      >
        <Icon name="bookmark" />
        {pending
          ? "Đang lưu..."
          : saved === null
            ? "Thử tải trạng thái lưu"
            : saved
              ? "Bỏ lưu"
              : "Lưu việc làm"}
      </button>
      {message ? (
        <p className="save-job-error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
