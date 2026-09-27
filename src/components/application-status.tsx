import type { JobApplication } from "@/types/job";

const statusLabels: Record<JobApplication["status"], string> = {
  Submitted: "Đã nộp",
  Reviewing: "Đang xem xét",
  Accepted: "Đã chấp nhận",
  Rejected: "Chưa phù hợp",
};

export function ApplicationStatus({ status }: { status: JobApplication["status"] }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{statusLabels[status]}</span>;
}
