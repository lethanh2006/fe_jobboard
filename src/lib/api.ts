import { cache } from "react";
import {
  getJobById as getFallbackJobById,
  jobs as fallbackJobs,
} from "@/data/jobs";
import { backendApiUrl } from "@/lib/api-config";
import { foldText } from "@/lib/text";
import type {
  ApplicantDetail,
  ApplicationView,
  CandidateProfile,
  EmployerJob,
  EmployerJobDetail,
  CategoryCount,
  CompanyProfile,
  Job,
  JobApplication,
  JobFormInput,
  JobLevel,
  JobMatch,
  JobSearchParams,
  JobSearchResult,
  SavedJob,
  SavedJobsPage,
  WorkMode,
} from "@/types/job";

const browserApiUrl = "/api/backend";

type ApiJob = {
  id: number;
  title: string;
  companyId: number;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  level: "Internship" | "Junior" | "Middle" | "Senior" | "Lead";
  workMode: "Onsite" | "Hybrid" | "Remote";
  category: string;
  summary?: string;
  description?: string[];
  requirements?: string[];
  benefits?: string[];
  postedAt: string;
  deadline: string;
  featured: boolean;
  skills: string[];
  status?: "Published" | "Closed";
  expired?: boolean;
  matchScore?: number;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ApiApplication = {
  id: number;
  jobId: number;
  candidateId: number;
  candidateName?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  status: JobApplication["status"];
  appliedAt: string;
  matchScore?: number;
};

type ApiProblem = {
  title?: string;
  detail?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const levelLabels: Record<ApiJob["level"], JobLevel> = {
  Internship: "Thực tập",
  Junior: "Junior",
  Middle: "Middle",
  Senior: "Senior",
  Lead: "Lead",
};

const workModeLabels: Record<ApiJob["workMode"], WorkMode> = {
  Onsite: "Tại văn phòng",
  Hybrid: "Linh hoạt",
  Remote: "Từ xa",
};

const logoTones: Job["logoTone"][] = ["navy", "coral", "sky", "violet", "mint", "amber"];

export const logoToneFor = (jobId: number) => logoTones[(jobId - 1) % logoTones.length];

function mapJob(job: ApiJob): Job {
  const fallback = getFallbackJobById(job.id);

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyId: job.companyId,
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    level: levelLabels[job.level],
    workMode: workModeLabels[job.workMode],
    category: job.category,
    skills: job.skills,
    summary: job.summary ?? fallback?.summary ?? "",
    description: job.description ?? fallback?.description ?? [],
    requirements: job.requirements ?? fallback?.requirements ?? [],
    benefits: job.benefits ?? fallback?.benefits ?? [],
    postedAt: toDateOnly(job.postedAt),
    deadline: toDateOnly(job.deadline),
    featured: job.featured,
    logoText: getLogoText(job.company),
    logoTone: logoToneFor(job.id),
    status: job.status,
    expired: job.expired,
    matchScore: job.matchScore,
  };
}

function mapApplication(application: ApiApplication): ApplicationView {
  const fallbackJob = getFallbackJobById(application.jobId);

  return {
    id: application.id,
    jobId: application.jobId,
    candidateId: application.candidateId,
    candidateName: application.candidateName ?? `Ứng viên #${application.candidateId}`,
    jobTitle: application.jobTitle ?? fallbackJob?.title ?? `Việc làm #${application.jobId}`,
    company: application.company ?? fallbackJob?.company ?? "Đang cập nhật",
    location: application.location ?? fallbackJob?.location ?? "Đang cập nhật",
    status: application.status,
    appliedAt: toDateOnly(application.appliedAt),
    matchScore: application.matchScore,
  };
}

export function getLogoText(company: string) {
  const words = company.trim().split(/\s+/);
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : words
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function toDateOnly(value: string) {
  return value.slice(0, 10);
}

export async function request<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
): Promise<T> {
  const baseUrl = typeof window === "undefined" ? backendApiUrl : browserApiUrl;
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ApiProblem;
    throw new ApiError(
      problem.detail ?? problem.title ?? "Không thể kết nối với JobBoard API.",
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function getSavedJobs(page: number, accessToken: string): Promise<SavedJobsPage> {
  const result = await request<PagedResult<Omit<SavedJob, "job"> & { job: ApiJob | null }>>(
    `/saved-jobs?page=${page}&pageSize=20`,
    undefined,
    accessToken,
  );

  return {
    ...result,
    items: result.items.map((item) => ({ ...item, job: item.job ? mapJob(item.job) : null })),
  };
}

/** Một request cho cả trang kết quả, không gọi riêng cho từng thẻ việc làm. */
export function getSavedJobIds(jobIds: number[], accessToken?: string): Promise<number[]> {
  if (jobIds.length === 0) {
    return Promise.resolve([]);
  }

  return request<number[]>(
    `/saved-jobs/ids?jobIds=${[...new Set(jobIds)].join(",")}`,
    undefined,
    accessToken,
  );
}

export function setJobSaved(jobId: number, saved: boolean) {
  return request<void>(`/saved-jobs/${jobId}`, { method: saved ? "PUT" : "DELETE" });
}

export async function getJobs(): Promise<Job[]> {
  try {
    const result = await request<PagedResult<ApiJob>>("/jobs?page=1&pageSize=100");
    return result.items.map(mapJob);
  } catch {
    return fallbackJobs;
  }
}

/** Được nhớ trong một lần render để `generateMetadata` và trang không gọi API hai lần. */
export const getJobById = cache(async (id: number): Promise<Job | undefined> => {
  try {
    return mapJob(await request<ApiJob>(`/jobs/${id}`));
  } catch (error) {
    // 404 nghĩa là tin không tồn tại hoặc chưa công khai: không thay bằng dữ liệu mẫu.
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }

    return getFallbackJobById(id);
  }
});

/** Tìm tin ở phía server; khi API không khả dụng thì lọc trên dữ liệu mẫu để trang vẫn dùng được. */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const query = new URLSearchParams();
  const set = (name: string, value: string | number | boolean | undefined) => {
    if (value !== undefined && value !== "") {
      query.set(name, String(value));
    }
  };
  set("keyword", params.keyword);
  set("location", params.location);
  set("category", params.category);
  set("level", params.level);
  set("minimumSalary", params.minimumSalary);
  set("featured", params.featured);
  set("companyId", params.companyId);
  set("sort", params.sort);
  set("page", params.page);
  set("pageSize", params.pageSize);
  params.skills?.forEach((skill) => query.append("skills", skill));

  try {
    const result = await request<PagedResult<ApiJob>>(`/jobs?${query}`);
    return { ...result, items: result.items.map(mapJob) };
  } catch (error) {
    // Lỗi 4xx là tham số không hợp lệ: hiển thị thay vì che bằng dữ liệu mẫu.
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      throw error;
    }

    return searchFallbackJobs(params);
  }
}

const apiLevelByLabel: Record<JobLevel, ApiJob["level"]> = {
  "Thực tập": "Internship",
  Junior: "Junior",
  Middle: "Middle",
  Senior: "Senior",
  Lead: "Lead",
};

function searchFallbackJobs(params: JobSearchParams): JobSearchResult {
  const contains = (text: string, part?: string) =>
    !part || foldText(text).includes(foldText(part.trim()));
  const requiredSkills = (params.skills ?? []).map((skill) => foldText(skill.trim()));

  const matches = fallbackJobs
    .filter(
      (job) =>
        (contains(job.title, params.keyword) ||
          contains(job.company, params.keyword) ||
          job.skills.some((skill) => contains(skill, params.keyword))) &&
        contains(job.location, params.location) &&
        contains(job.category, params.category) &&
        (!params.level || apiLevelByLabel[job.level] === params.level) &&
        (params.minimumSalary === undefined || job.salaryMin >= params.minimumSalary) &&
        (params.featured === undefined || job.featured === params.featured) &&
        (params.companyId === undefined || job.companyId === params.companyId) &&
        requiredSkills.every((required) =>
          job.skills.some((skill) => foldText(skill) === required),
        ),
    )
    .sort((first, second) =>
      params.sort === "SalaryDescending"
        ? second.salaryMax - first.salaryMax || first.id - second.id
        : second.postedAt.localeCompare(first.postedAt) || first.id - second.id,
    );

  const pageSize = params.pageSize ?? 20;
  const page = params.page ?? 1;

  return {
    items: matches.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalItems: matches.length,
    totalPages: Math.ceil(matches.length / pageSize),
  };
}

export async function getCategories(): Promise<CategoryCount[]> {
  try {
    return await request<CategoryCount[]>("/jobs/categories");
  } catch {
    const counts = new Map<string, number>();
    fallbackJobs.forEach((job) => counts.set(job.category, (counts.get(job.category) ?? 0) + 1));
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }
}

export async function getJobMatches(
  candidateId: number,
  jobIds: number[],
  accessToken: string,
): Promise<JobMatch[]> {
  if (jobIds.length === 0) {
    return [];
  }

  return request<JobMatch[]>(
    `/candidates/${candidateId}/job-matches?jobIds=${jobIds.slice(0, 50).join(",")}`,
    undefined,
    accessToken,
  );
}

export async function getRecommendedJobs(
  candidateId: number,
  accessToken: string,
  limit = 6,
): Promise<Job[]> {
  const result = await request<ApiJob[]>(
    `/candidates/${candidateId}/recommended-jobs?limit=${limit}`,
    undefined,
    accessToken,
  );
  return result.map(mapJob);
}

export async function applyToJob(jobId: number) {
  const result = await request<ApiApplication>("/applications", {
    method: "POST",
    body: JSON.stringify({ jobId }),
  });

  return mapApplication(result);
}

export async function getCandidateApplications(
  candidateId: number,
  accessToken: string,
): Promise<ApplicationView[]> {
  const result = await request<ApiApplication[]>(
    `/candidates/${candidateId}/applications`,
    undefined,
    accessToken,
  );
  return result.map(mapApplication);
}

export async function getEmployerJobs(
  companyId: number,
  accessToken: string,
): Promise<EmployerJob[]> {
  const result = await request<EmployerJob[]>(
    `/employers/${companyId}/jobs`,
    undefined,
    accessToken,
  );
  return result.map(mapEmployerJob);
}

export async function getEmployerApplications(
  companyId: number,
  accessToken: string,
): Promise<ApplicationView[]> {
  const result = await request<ApiApplication[]>(
    `/employers/${companyId}/applications`,
    undefined,
    accessToken,
  );
  return result.map(mapApplication);
}

function toJobPayload(input: JobFormInput) {
  return {
    ...input,
    // Hạn nộp là cuối ngày được chọn; giữ nguyên ngày khi hiển thị lại (toDateOnly).
    deadline: `${input.deadline}T23:59:59Z`,
  };
}

function mapEmployerJob<T extends EmployerJob>(job: T): T {
  return {
    ...job,
    deadline: toDateOnly(job.deadline),
    postedAt: toDateOnly(job.postedAt),
  };
}

export async function createEmployerJob(companyId: number, input: JobFormInput) {
  return mapEmployerJob(
    await request<EmployerJob>(`/employers/${companyId}/jobs`, {
      method: "POST",
      body: JSON.stringify(toJobPayload(input)),
    }),
  );
}

export async function getEmployerJobDetail(
  companyId: number,
  jobId: number,
): Promise<EmployerJobDetail> {
  return mapEmployerJob(
    await request<EmployerJobDetail>(`/employers/${companyId}/jobs/${jobId}`),
  );
}

export async function updateEmployerJob(
  companyId: number,
  jobId: number,
  input: JobFormInput,
): Promise<EmployerJobDetail> {
  return mapEmployerJob(
    await request<EmployerJobDetail>(`/employers/${companyId}/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify(toJobPayload(input)),
    }),
  );
}

export async function getApplicantDetail(
  companyId: number,
  applicationId: number,
): Promise<ApplicantDetail> {
  const detail = await request<
    Omit<ApplicantDetail, "application"> & { application: ApiApplication }
  >(`/employers/${companyId}/applications/${applicationId}`);

  return {
    ...detail,
    application: {
      ...mapApplication(detail.application),
      matchScore: detail.application.matchScore ?? 0,
    },
  };
}

export async function changeEmployerJobState(
  companyId: number,
  jobId: number,
  action: "publish" | "close",
) {
  return request<EmployerJob>(`/employers/${companyId}/jobs/${jobId}/${action}`, {
    method: "POST",
  });
}

export async function changeApplicationStatus(
  applicationId: number,
  status: JobApplication["status"],
) {
  return request<ApiApplication>(`/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getCandidateProfile(
  candidateId: number,
  accessToken: string,
): Promise<CandidateProfile> {
  return request<CandidateProfile>(
    `/candidates/${candidateId}/profile`,
    undefined,
    accessToken,
  );
}

export async function updateCandidateProfile(
  candidateId: number,
  profile: Omit<CandidateProfile, "id" | "name">,
) {
  return request<CandidateProfile>(`/candidates/${candidateId}/profile`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

/** Hồ sơ công khai của công ty; `undefined` khi không tồn tại hoặc công ty bị khóa. */
export const getCompany = cache(async (id: number): Promise<CompanyProfile | undefined> => {
  try {
    return await request<CompanyProfile>(`/companies/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return undefined;
    }

    throw error;
  }
});

export async function getOwnCompany(
  companyId: number,
  accessToken: string,
): Promise<CompanyProfile> {
  return request<CompanyProfile>(`/employers/${companyId}/company`, undefined, accessToken);
}

export async function updateCompany(
  companyId: number,
  profile: Pick<CompanyProfile, "name" | "location" | "website" | "description">,
) {
  return request<CompanyProfile>(`/employers/${companyId}/company`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}
