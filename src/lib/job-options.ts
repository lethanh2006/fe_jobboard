import type { ApiJobLevel, ApiWorkMode } from "@/types/job";

export const jobLevelOptions: { value: ApiJobLevel; label: string }[] = [
  { value: "Internship", label: "Thực tập" },
  { value: "Junior", label: "Junior" },
  { value: "Middle", label: "Middle" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
];

export const workModeOptions: { value: ApiWorkMode; label: string }[] = [
  { value: "Onsite", label: "Tại văn phòng" },
  { value: "Hybrid", label: "Linh hoạt" },
  { value: "Remote", label: "Từ xa" },
];

export const jobCategories = [
  "Lập trình Backend",
  "Lập trình Frontend",
  "DevOps & Cloud",
  "Thiết kế sản phẩm",
  "Dữ liệu",
  "Kiểm thử phần mềm",
  "Quản lý sản phẩm",
  "Kinh doanh",
  "Marketing",
];

/** Gợi ý khi nhập kỹ năng; vẫn cho phép nhập kỹ năng bất kỳ. */
export const suggestedSkills = [
  "C#",
  "ASP.NET Core",
  "Java",
  "Spring Boot",
  "Node.js",
  "NestJS",
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Vue",
  "Python",
  "Go",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "CI/CD",
  "Git",
  "Figma",
  "UX Research",
  "Power BI",
  "Playwright",
  "API Testing",
];

export const MAX_JOB_SKILLS = 15;
export const MAX_CANDIDATE_SKILLS = 30;

/** Biểu tượng cho thẻ lĩnh vực dựa trên tên lĩnh vực. */
export function categoryIcon(name: string): "code" | "chart" | "pen" | "cloud" | "briefcase" {
  const text = name.toLowerCase();

  if (/dữ liệu|data/.test(text)) return "chart";
  if (/thiết kế|design/.test(text)) return "pen";
  if (/devops|cloud/.test(text)) return "cloud";
  if (/lập trình|phần mềm|kiểm thử|code/.test(text)) return "code";

  return "briefcase";
}
