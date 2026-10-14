import { AdminPagination } from "@/components/admin/admin-pagination";
import { getAuditLogs } from "@/lib/admin-api";
import { parsePage } from "@/lib/admin-params";
import { formatDateTime } from "@/lib/format";
import type { AuditEntry } from "@/types/admin";

const actionLabels: Record<AuditEntry["action"], string> = {
  JobTakenDown: "Gỡ tin",
  JobReinstated: "Khôi phục tin",
  CompanySuspended: "Khóa công ty",
  CompanyReactivated: "Mở khóa công ty",
  UserDisabled: "Khóa tài khoản",
  UserEnabled: "Mở khóa tài khoản",
};

const targetLabels: Record<AuditEntry["targetType"], string> = {
  Job: "Tin",
  Company: "Công ty",
  User: "Tài khoản",
};

export async function AdminAuditTab({
  accessToken,
  raw,
}: {
  accessToken: string;
  raw: Record<string, string | string[] | undefined>;
}) {
  const result = await getAuditLogs({ page: parsePage(raw), pageSize: 20 }, accessToken);

  return (
    <>
      {result.items.length > 0 ? (
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thao tác</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDateTime(entry.createdAt)}</td>
                  <td>{entry.actorName}</td>
                  <td>{actionLabels[entry.action]}</td>
                  <td>
                    {targetLabels[entry.targetType]} #{entry.targetId}
                  </td>
                  <td>{entry.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="table-empty">Chưa có thao tác nào được ghi lại.</p>
      )}
      <AdminPagination query={{ tab: "nhat-ky" }} page={result.page} totalPages={result.totalPages} />
    </>
  );
}
