"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import {
  disableUser,
  enableUser,
  reactivateCompany,
  reinstateJob,
  suspendCompany,
  takeDownJob,
} from "@/lib/admin-api";
import type { AdminCompany, AdminJob, AdminUser } from "@/types/admin";

/** Chạy một thao tác kiểm duyệt rồi làm mới dữ liệu trang; lỗi được hiển thị tại chỗ. */
function useModerationAction() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setIsRunning(true);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Không thể thực hiện.");
    } finally {
      setIsRunning(false);
    }
  }

  return { run, error, isRunning };
}

export function JobModerationActions({ job }: { job: AdminJob }) {
  const { run, error, isRunning } = useModerationAction();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="row-actions admin-actions">
      {job.status === "Published" || job.status === "Closed" ? (
        <Link className="table-action table-action-neutral" href={`/viec-lam/${job.id}`}>
          Xem tin
        </Link>
      ) : null}
      {job.status === "Removed" ? (
        <button className="table-action publish-action" type="button" disabled={isRunning} onClick={() => run(() => reinstateJob(job.id))}>
          Khôi phục
        </button>
      ) : (
        <button className="table-action" type="button" onClick={() => setDialogOpen(true)}>
          Gỡ tin
        </button>
      )}
      {error ? <span className="form-error" role="alert">{error}</span> : null}
      <ReasonDialog
        open={dialogOpen}
        title={`Gỡ tin “${job.title}”`}
        description="Tin sẽ biến mất khỏi trang công khai. Nhà tuyển dụng sẽ thấy lý do này."
        confirmLabel="Gỡ tin"
        onCancel={() => setDialogOpen(false)}
        onConfirm={async (reason) => {
          await takeDownJob(job.id, reason);
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

export function CompanyModerationActions({ company }: { company: AdminCompany }) {
  const { run, error, isRunning } = useModerationAction();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="row-actions admin-actions">
      {company.status === "Active" ? (
        <Link className="table-action table-action-neutral" href={`/cong-ty/${company.id}`}>
          Xem trang
        </Link>
      ) : null}
      {company.status === "Suspended" ? (
        <button className="table-action publish-action" type="button" disabled={isRunning} onClick={() => run(() => reactivateCompany(company.id))}>
          Mở khóa
        </button>
      ) : (
        <button className="table-action" type="button" onClick={() => setDialogOpen(true)}>
          Khóa
        </button>
      )}
      {error ? <span className="form-error" role="alert">{error}</span> : null}
      <ReasonDialog
        open={dialogOpen}
        title={`Khóa công ty “${company.name}”`}
        description="Mọi tin của công ty sẽ bị ẩn và công ty không đăng được tin mới cho tới khi được mở khóa."
        confirmLabel="Khóa công ty"
        onCancel={() => setDialogOpen(false)}
        onConfirm={async (reason) => {
          await suspendCompany(company.id, reason);
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

export function UserModerationActions({
  user,
  currentUserId,
}: {
  user: AdminUser;
  currentUserId: number;
}) {
  const { run, error, isRunning } = useModerationAction();

  if (user.role === "Admin" || user.id === currentUserId) {
    return <span className="muted-action">—</span>;
  }

  return (
    <div className="row-actions admin-actions">
      {user.disabled ? (
        <button className="table-action publish-action" type="button" disabled={isRunning} onClick={() => run(() => enableUser(user.id))}>
          Mở khóa
        </button>
      ) : (
        <button
          className="table-action"
          type="button"
          disabled={isRunning}
          onClick={() => {
            if (window.confirm(`Khóa tài khoản ${user.email}? Người dùng sẽ bị đăng xuất khỏi mọi thiết bị.`)) {
              void run(() => disableUser(user.id));
            }
          }}
        >
          Khóa
        </button>
      )}
      {error ? <span className="form-error" role="alert">{error}</span> : null}
    </div>
  );
}
