export type UserRole = "Candidate" | "Employer" | "Admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyId: number | null;
  companyName: string | null;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
};
