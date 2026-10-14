"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SavedJobsRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="button button-small"
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Đang tải..." : "Thử lại"}
    </button>
  );
}
