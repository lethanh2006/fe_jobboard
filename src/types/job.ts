export type JobLevel = "Thực tập" | "Junior" | "Middle" | "Senior" | "Lead";

export type WorkMode = "Tại văn phòng" | "Linh hoạt" | "Từ xa";

export type Job = {
  id: number;
  title: string;
  company: string;
  companyId: number;
  location: string;
  salaryMin: number;
  salaryMax: number;
  level: JobLevel;
  workMode: WorkMode;
  category: string;
  skills: string[];
  summary: string;
  description: string[];
  requirements: string[];
  benefits: string[];
  postedAt: string;
  deadline: string;
  featured: boolean;
  logoText: string;
  logoTone: "mint" | "navy" | "coral" | "violet" | "sky" | "amber";
};

export type JobApplication = {
  id: number;
  jobId: number;
  status: "Submitted" | "Reviewing" | "Accepted" | "Rejected";
  appliedAt: string;
};

export type ApplicationView = JobApplication & {
  candidateId: number;
  candidateName: string;
  jobTitle: string;
  company: string;
  location: string;
};

export type EmployerJob = {
  id: number;
  title: string;
  status: "Draft" | "Published" | "Closed";
  applications: number;
  deadline: string;
  postedAt: string;
};

export type CandidateProfile = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
  skills: string[];
};
