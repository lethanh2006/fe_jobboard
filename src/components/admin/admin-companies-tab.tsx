import Link from "next/link";
import { AdminFilterForm } from "@/components/admin/admin-filter-form";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CompanyModerationActions } from "@/components/admin/moderation-actions";
import { getAdminCompanies } from "@/lib/admin-api";
import { firstParam, oneOf, parsePage } from "@/lib/admin-params";

const statuses = ["Active", "Suspended"] as const;
const statusLabels = { Active: "Hoạt động", Suspended: "Bị khóa" } as const;

export async function AdminCompaniesTab({
  accessToken,
  raw,
}: {
  accessToken: string;
  raw: Record<string, string | string[] | undefined>;
}) {
  const keyword = firstParam(raw.keyword);
  const status = oneOf(firstParam(raw.status), statuses);
  const result = await getAdminCompanies(
    { keyword, status, page: parsePage(raw), pageSize: 15 },
    accessToken,
  );

  return (
    <>
      <AdminFilterForm tab="cong-ty">
        <label>
          <span>Từ khóa</span>
          <input name="keyword" defaultValue={keyword} placeholder="Tên công ty" />
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
      </AdminFilterForm>

      {result.items.length > 0 ? (
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Công ty</th>
                <th>Trạng thái</th>
                <th>Tin</th>
                <th>Tài khoản</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                    <span>
                      #{company.id}
                      {company.location ? ` · ${company.location}` : ""}
                    </span>
                  </td>
                  <td>
                    <span className={`job-state job-state-${company.status === "Active" ? "published" : "removed"}`}>
                      {statusLabels[company.status]}
                    </span>
                    {company.suspensionReason ? (
                      <span className="removal-reason">Lý do: {company.suspensionReason}</span>
                    ) : null}
                  </td>
                  <td>
                    {company.jobs > 0 ? (
                      <Link className="table-link" href={`/quan-tri?tab=tin&companyId=${company.id}`}>
                        {company.jobs} tin
                      </Link>
                    ) : (
                      0
                    )}
                  </td>
                  <td>{company.members}</td>
                  <td>
                    <CompanyModerationActions company={company} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="table-empty">Không có công ty nào khớp bộ lọc.</p>
      )}
      <AdminPagination
        query={{ tab: "cong-ty", keyword, status }}
        page={result.page}
        totalPages={result.totalPages}
      />
    </>
  );
}
