import Link from "next/link";
import { AdminFilterForm } from "@/components/admin/admin-filter-form";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { JobModerationActions } from "@/components/admin/moderation-actions";
import { getAdminJobs } from "@/lib/admin-api";
import { firstParam, oneOf, parsePage } from "@/lib/admin-params";
import { formatDate } from "@/lib/format";
import type { AdminJobStatus } from "@/types/admin";

const statuses: AdminJobStatus[] = ["Draft", "Published", "Closed", "Removed"];
const statusLabels: Record<AdminJobStatus, string> = {
  Draft: "Bản nháp",
  Published: "Đang đăng",
  Closed: "Đã đóng",
  Removed: "Bị gỡ",
};

export async function AdminJobsTab({
  accessToken,
  raw,
}: {
  accessToken: string;
  raw: Record<string, string | string[] | undefined>;
}) {
  const keyword = firstParam(raw.keyword);
  const status = oneOf(firstParam(raw.status), statuses);
  const companyId = /^\d+$/.test(firstParam(raw.companyId) ?? "") ? firstParam(raw.companyId) : undefined;
  const page = parsePage(raw);
  const result = await getAdminJobs(
    { keyword, status, companyId, page, pageSize: 15 },
    accessToken,
  );

  return (
    <>
      <AdminFilterForm tab="tin" hidden={{ companyId }}>
        <label>
          <span>Từ khóa</span>
          <input name="keyword" defaultValue={keyword} placeholder="Tiêu đề, công ty, kỹ năng" />
        </label>
        <label>
          <span>Trạng thái</span>
          <select name="status" defaultValue={status ?? ""}>
            <option value="">Tất cả</option>
            {statuses.map((item) => (
              <option value={item} key={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
        </label>
        {companyId ? <span className="filter-chip">Công ty #{companyId}</span> : null}
      </AdminFilterForm>

      {result.items.length > 0 ? (
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Tin tuyển dụng</th>
                <th>Trạng thái</th>
                <th>Đơn</th>
                <th>Hạn nộp</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <span>
                      #{String(job.id).padStart(3, "0")} ·{" "}
                      <Link className="inline-link" href={`/quan-tri?tab=tin&companyId=${job.companyId}`}>
                        {job.company}
                      </Link>
                    </span>
                  </td>
                  <td>
                    <span className={`job-state job-state-${job.status.toLowerCase()}`}>
                      {statusLabels[job.status]}
                    </span>
                    {job.removalReason ? (
                      <span className="removal-reason">Lý do: {job.removalReason}</span>
                    ) : null}
                  </td>
                  <td>{job.applications}</td>
                  <td>{formatDate(job.deadline)}</td>
                  <td>
                    <JobModerationActions job={job} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="table-empty">Không có tin nào khớp bộ lọc.</p>
      )}
      <AdminPagination
        query={{ tab: "tin", keyword, status, companyId }}
        page={result.page}
        totalPages={result.totalPages}
      />
    </>
  );
}
