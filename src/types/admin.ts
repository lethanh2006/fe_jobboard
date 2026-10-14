import type { UserRole } from "@/types/auth";

export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdminJobStatus = "Draft" | "Published" | "Closed" | "Removed";

export type AdminStats = {
  users: { candidates: number; employers: number; admins: number };
  companies: { active: number; suspended: number };
  jobs: { draft: number; published: number; closed: number; removed: number };
  applications: number;
};

export type AdminJob = {
  id: number;
  title: string;
  companyId: number;
  company: string;
  status: AdminJobStatus;
  removalReason: string | null;
  applications: number;
  postedAt: string;
  deadline: string;
};

export type AdminCompany = {
  id: number;
  name: string;
  location: string | null;
  status: "Active" | "Suspended";
  suspensionReason: string | null;
  jobs: number;
  members: number;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyId: number | null;
  companyName: string | null;
  disabled: boolean;
};

export type AuditEntry = {
  id: number;
  actorId: number;
  actorName: string;
  action:
    | "JobTakenDown"
    | "JobReinstated"
    | "CompanySuspended"
    | "CompanyReactivated"
    | "UserDisabled"
    | "UserEnabled";
  targetType: "Job" | "Company" | "User";
  targetId: number;
  detail: string | null;
  createdAt: string;
};
