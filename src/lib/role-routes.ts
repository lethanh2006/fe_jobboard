import type { UserRole } from "@/types/auth";

/** Trang chính của từng vai trò: nơi chuyển tới sau khi đăng nhập hoặc khi vào nhầm khu vực. */
export function homePathFor(role: UserRole): string {
  switch (role) {
    case "Employer":
      return "/nha-tuyen-dung";
    case "Admin":
      return "/quan-tri";
    default:
      return "/viec-lam";
  }
}
