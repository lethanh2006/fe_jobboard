import {
  getJobById as getFallbackJobById,
  jobs as fallbackJobs,
} from "@/data/jobs";
import { backendApiUrl } from "@/lib/api-config";
import type {
  ApplicantDetail,
  ApplicationView,
  CandidateProfile,
  EmployerJob,
  EmployerJobDetail,
  Job,
  JobApplication,
  JobFormInput,
  JobLevel,
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
    logoTone: logoTones[(job.id - 1) % logoTones.length],
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

function getLogoText(company: string) {
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

async function request<T>(
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

  return (await response.json()) as T;
}

export async function getJobs(): Promise<Job[]> {
  try {
    const result = await request<PagedResult<ApiJob>>("/jobs?page=1&pageSize=100");
    return result.items.map(mapJob);
  } catch {
    return fallbackJobs;
  }
}

export async function getJobById(id: number): Promise<Job | undefined> {
  try {
    return mapJob(await request<ApiJob>(`/jobs/${id}`));
  } catch {
    return getFallbackJobById(id);
  }
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
