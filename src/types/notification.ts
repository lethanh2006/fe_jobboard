export type Notification = {
  id: number;
  type: "ApplicationReceived" | "ApplicationStatusChanged" | "JobMatch" |
    "JobTakenDown" | "JobReinstated" | "CompanySuspended" | "CompanyReactivated";
  title: string;
  body: string;
  link: string | null;
  createdAt: string;
  read: boolean;
};

export type NotificationPage = {
  items: Notification[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
