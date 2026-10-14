import { AdminFilterForm } from "@/components/admin/admin-filter-form";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { UserModerationActions } from "@/components/admin/moderation-actions";
import { getAdminUsers } from "@/lib/admin-api";
import { firstParam, oneOf, parsePage } from "@/lib/admin-params";
import type { UserRole } from "@/types/auth";

const roles: UserRole[] = ["Candidate", "Employer", "Admin"];
const roleLabels: Record<UserRole, string> = {
  Candidate: "Ứng viên",
  Employer: "Nhà tuyển dụng",
  Admin: "Quản trị viên",
};

export async function AdminUsersTab({
  accessToken,
  currentUserId,
  raw,
}: {
  accessToken: string;
  currentUserId: number;
  raw: Record<string, string | string[] | undefined>;
}) {
  const keyword = firstParam(raw.keyword);
  const role = oneOf(firstParam(raw.role), roles);
  const disabled = oneOf(firstParam(raw.disabled), ["true", "false"] as const);
  const result = await getAdminUsers(
    { keyword, role, disabled, page: parsePage(raw), pageSize: 15 },
    accessToken,
  );

  return (
    <>
      <AdminFilterForm tab="nguoi-dung">
        <label>
          <span>Từ khóa</span>
          <input name="keyword" defaultValue={keyword} placeholder="Tên hoặc email" />
        </label>
        <label>
          <span>Vai trò</span>
          <select name="role" defaultValue={role ?? ""}>
            <option value="">Tất cả</option>
            {roles.map((item) => (
              <option value={item} key={item}>
                {roleLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Trạng thái</span>
          <select name="disabled" defaultValue={disabled ?? ""}>
            <option value="">Tất cả</option>
            <option value="false">Đang hoạt động</option>
            <option value="true">Đã bị khóa</option>
          </select>
        </label>
      </AdminFilterForm>

      {result.items.length > 0 ? (
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Công ty</th>
                <th>Trạng thái</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </td>
                  <td>{roleLabels[user.role]}</td>
                  <td>{user.companyName ?? "—"}</td>
                  <td>
                    <span className={`job-state job-state-${user.disabled ? "removed" : "published"}`}>
                      {user.disabled ? "Đã khóa" : "Hoạt động"}
                    </span>
                  </td>
                  <td>
                    <UserModerationActions user={user} currentUserId={currentUserId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="table-empty">Không có tài khoản nào khớp bộ lọc.</p>
      )}
      <AdminPagination
        query={{ tab: "nguoi-dung", keyword, role, disabled }}
        page={result.page}
        totalPages={result.totalPages}
      />
    </>
  );
}
