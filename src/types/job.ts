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
  /** Chỉ có khi tải chi tiết tin: Published (đang tuyển) hoặc Closed (đã đóng). */
  status?: "Published" | "Closed";
  /** Chỉ có khi tải chi tiết tin: đã quá hạn nộp hồ sơ. */
  expired?: boolean;
  /** Độ phù hợp 0–100 với ứng viên đang đăng nhập (nếu có). */
  matchScore?: number;
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
  /** Độ phù hợp 0–100; chỉ có ở danh sách phía nhà tuyển dụng. */
  matchScore?: number;
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

/** Giá trị enum của API (khác nhãn tiếng Việt dùng để hiển thị trong `Job`). */
export type ApiJobLevel = "Internship" | "Junior" | "Middle" | "Senior" | "Lead";

export type ApiWorkMode = "Onsite" | "Hybrid" | "Remote";

/** Nội dung nhà tuyển dụng nhập khi tạo/sửa một tin. */
export type JobFormInput = {
  title: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  /** Ngày dạng YYYY-MM-DD. */
  deadline: string;
  level: ApiJobLevel;
  workMode: ApiWorkMode;
  category: string;
  summary: string;
  description: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
};

export type EmployerJobDetail = EmployerJob &
  Omit<JobFormInput, "deadline" | "title"> & { featured: boolean };

export type ApplicantDetail = {
  application: ApplicationView & { matchScore: number };
  candidate: CandidateProfile;
  matchedSkills: string[];
  missingSkills: string[];
  salaryFit: boolean;
};

export type JobSortOption = "Newest" | "SalaryDescending";

export type JobSearchParams = {
  keyword?: string;
  location?: string;
  category?: string;
  level?: ApiJobLevel;
  minimumSalary?: number;
  featured?: boolean;
  skills?: string[];
  sort?: JobSortOption;
  page?: number;
  pageSize?: number;
};

export type JobSearchResult = {
  items: Job[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CategoryCount = { name: string; count: number };

export type JobMatch = {
  jobId: number;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  salaryFit: boolean;
};
