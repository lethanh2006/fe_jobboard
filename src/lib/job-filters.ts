import { jobCategories } from "@/lib/job-options";
import type { ApiJobLevel, JobSearchParams, JobSortOption } from "@/types/job";

export const JOBS_PAGE_SIZE = 8;

const levels: ApiJobLevel[] = ["Internship", "Junior", "Middle", "Senior", "Lead"];

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

/** Bộ lọc trên URL của trang /viec-lam đã được kiểm tra: giá trị lạ bị bỏ thay vì gây lỗi API. */
export type JobFilters = {
  keyword?: string;
  location?: string;
  category?: string;
  level?: ApiJobLevel;
  minimumSalary?: number;
  sort: JobSortOption;
  page: number;
};

export function parseJobFilters(raw: RawParams): JobFilters {
  const level = first(raw.level);
  const minimumSalary = Number(first(raw.minimumSalary));
  const page = Number(first(raw.page));

  return {
    keyword: first(raw.keyword)?.slice(0, 200),
    location: first(raw.location)?.slice(0, 200),
    category: first(raw.category)?.slice(0, 120),
    level: levels.includes(level as ApiJobLevel) ? (level as ApiJobLevel) : undefined,
    minimumSalary:
      Number.isFinite(minimumSalary) && minimumSalary > 0 ? minimumSalary : undefined,
    sort: first(raw.sort) === "SalaryDescending" ? "SalaryDescending" : "Newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function toSearchParams(filters: JobFilters): JobSearchParams {
  return { ...filters, pageSize: JOBS_PAGE_SIZE };
}

/** Đường dẫn /viec-lam với bộ lọc hiện tại, có thể ghi đè một vài giá trị (ví dụ trang). */
export function buildJobsHref(filters: JobFilters, overrides: Partial<JobFilters> = {}) {
  const merged = { ...filters, ...overrides };
  const query = new URLSearchParams();

  (["keyword", "location", "category", "level", "minimumSalary"] as const).forEach((name) => {
    if (merged[name] !== undefined) {
      query.set(name, String(merged[name]));
    }
  });
  if (merged.sort !== "Newest") {
    query.set("sort", merged.sort);
  }
  if (merged.page > 1) {
    query.set("page", String(merged.page));
  }

  const text = query.toString();
  return text ? `/viec-lam?${text}` : "/viec-lam";
}

/** Lĩnh vực hiển thị trong bộ lọc: lĩnh vực đang có tin, cộng gợi ý mặc định nếu chưa có. */
export function categoryOptions(active: { name: string; count: number }[], selected?: string) {
  const names = new Set(active.map((item) => item.name));
  const options = active.map((item) => ({ value: item.name, label: `${item.name} (${item.count})` }));

  if (selected && !names.has(selected)) {
    options.unshift({ value: selected, label: selected });
  }
  if (options.length === 0) {
    return jobCategories.map((name) => ({ value: name, label: name }));
  }

  return options;
}
