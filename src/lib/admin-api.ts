import { request } from "@/lib/api";
import type {
  AdminCompany,
  AdminJob,
  AdminStats,
  AdminUser,
  AuditEntry,
  Paged,
} from "@/types/admin";

type ListParams = Record<string, string | number | boolean | undefined>;

function toQuery(params: ListParams) {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(name, String(value));
    }
  }

  const text = query.toString();
  return text ? `?${text}` : "";
}

const dateOnly = (value: string) => value.slice(0, 10);

export function getAdminStats(accessToken: string) {
  return request<AdminStats>("/admin/stats", undefined, accessToken);
}

export async function getAdminJobs(params: ListParams, accessToken: string) {
  const result = await request<Paged<AdminJob>>(
    `/admin/jobs${toQuery(params)}`,
    undefined,
    accessToken,
  );
  return {
    ...result,
    items: result.items.map((job) => ({
      ...job,
      postedAt: dateOnly(job.postedAt),
      deadline: dateOnly(job.deadline),
    })),
  };
}

export function getAdminCompanies(params: ListParams, accessToken: string) {
  return request<Paged<AdminCompany>>(
    `/admin/companies${toQuery(params)}`,
    undefined,
    accessToken,
  );
}

export function getAdminUsers(params: ListParams, accessToken: string) {
  return request<Paged<AdminUser>>(
    `/admin/users${toQuery(params)}`,
    undefined,
    accessToken,
  );
}

export function getAuditLogs(params: ListParams, accessToken: string) {
  return request<Paged<AuditEntry>>(
    `/admin/audit-logs${toQuery(params)}`,
    undefined,
    accessToken,
  );
}

// Các thao tác dưới đây chạy ở trình duyệt qua proxy /api/backend (có cookie phiên).
const post = (path: string, body?: unknown) =>
  request<unknown>(path, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

export const takeDownJob = (id: number, reason: string) =>
  post(`/admin/jobs/${id}/takedown`, { reason });
export const reinstateJob = (id: number) => post(`/admin/jobs/${id}/reinstate`);
export const suspendCompany = (id: number, reason: string) =>
  post(`/admin/companies/${id}/suspend`, { reason });
export const reactivateCompany = (id: number) => post(`/admin/companies/${id}/reactivate`);
export const disableUser = (id: number) => post(`/admin/users/${id}/disable`);
export const enableUser = (id: number) => post(`/admin/users/${id}/enable`);
