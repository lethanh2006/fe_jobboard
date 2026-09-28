import {
  demoApplications,
  getJobById as getFallbackJobById,
  jobs as fallbackJobs,
} from "@/data/jobs";
import type {
  ApplicationView,
  EmployerJob,
  Job,
  JobApplication,
  JobLevel,
  WorkMode,
} from "@/types/job";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

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
};

type ApiProblem = {
  title?: string;
  detail?: string;
};

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ApiProblem;
    throw new Error(problem.detail ?? problem.title ?? "Không thể kết nối với JobBoard API.");
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

export async function applyToJob(candidateId: number, jobId: number) {
  const result = await request<ApiApplication>("/applications", {
    method: "POST",
    body: JSON.stringify({ candidateId, jobId }),
  });

  return mapApplication(result);
}

export async function getCandidateApplications(candidateId: number): Promise<ApplicationView[]> {
  try {
    const result = await request<ApiApplication[]>(`/candidates/${candidateId}/applications`);
    return result.map(mapApplication);
  } catch {
    return demoApplications.map((application) =>
      mapApplication({ ...application, candidateId }),
    );
  }
}

export async function getEmployerJobs(companyId: number): Promise<EmployerJob[]> {
  try {
    const result = await request<EmployerJob[]>(`/employers/${companyId}/jobs`);
    return result.map((job) => ({
      ...job,
      deadline: toDateOnly(job.deadline),
      postedAt: toDateOnly(job.postedAt),
    }));
  } catch {
    return [];
  }
}

export async function getEmployerApplications(companyId: number): Promise<ApplicationView[]> {
  try {
    const result = await request<ApiApplication[]>(`/employers/${companyId}/applications`);
    return result.map(mapApplication);
  } catch {
    return [];
  }
}

export async function createEmployerJob(
  companyId: number,
  input: {
    title: string;
    deadline: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
  },
) {
  const job = await request<EmployerJob>(`/employers/${companyId}/jobs`, {
    method: "POST",
    body: JSON.stringify({
      companyName: "Nova Technology",
      title: input.title,
      location: input.location,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      deadline: `${input.deadline}T23:59:59Z`,
      level: "Middle",
      workMode: "Hybrid",
      category: "Công nghệ",
      summary: "Tin tuyển dụng mới từ Nova Technology.",
      skills: [],
    }),
  });

  return {
    ...job,
    deadline: toDateOnly(job.deadline),
    postedAt: toDateOnly(job.postedAt),
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
  companyId: number,
  applicationId: number,
  status: JobApplication["status"],
) {
  return request<ApiApplication>(`/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ companyId, status }),
  });
}
