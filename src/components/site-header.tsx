import Link from "next/link";
import { Icon } from "@/components/icon";
import { NotificationLink } from "@/components/notification-link";
import { getSession } from "@/lib/server-auth";
import type { AuthUser, UserRole } from "@/types/auth";

type NavItem = { href: string; label: string };

/** Menu chính theo vai trò: mỗi người chỉ thấy các mục dùng được cho mình. */
function navigationFor(role?: UserRole): NavItem[] {
  const jobs = { href: "/viec-lam", label: "Việc làm" };

  switch (role) {
    case "Candidate":
      return [jobs, { href: "/ung-vien/don-ung-tuyen", label: "Đơn ứng tuyển" }];
    case "Employer":
      return [
        jobs,
        { href: "/nha-tuyen-dung", label: "Tin tuyển dụng" },
        { href: "/nha-tuyen-dung/cong-ty", label: "Hồ sơ công ty" },
      ];
    case "Admin":
      return [jobs, { href: "/quan-tri", label: "Quản trị" }];
    default:
      return [jobs, { href: "/dang-ky/nha-tuyen-dung", label: "Dành cho nhà tuyển dụng" }];
  }
}

function primaryActionFor(user: AuthUser | null) {
  if (!user) {
    return { href: "/dang-ky", label: "Đăng ký" };
  }

  return user.role === "Candidate"
    ? { href: "/ung-vien/ho-so", label: "Hồ sơ của tôi" }
    : user.role === "Employer"
      ? { href: "/nha-tuyen-dung", label: "Đăng tuyển" }
      : { href: "/viec-lam", label: "Xem việc làm" };
}

export async function SiteHeader({ user }: { user?: AuthUser | null }) {
  const currentUser = user === undefined ? (await getSession())?.user ?? null : user;
  const navigation = navigationFor(currentUser?.role);
  const primaryAction = primaryActionFor(currentUser);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="JobBoard - Trang chủ">
          <span className="brand-mark">
            <Icon name="briefcase" />
          </span>
          <span>JobBoard</span>
        </Link>

        <nav className="main-nav" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <>
              <Link
                className="signed-in-user"
                href="/tai-khoan/doi-mat-khau"
                title="Bảo mật tài khoản"
              >
                {currentUser.name}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="text-button" type="submit">Đăng xuất</button>
              </form>
            </>
          ) : (
            <Link className="text-button" href="/dang-nhap">
              Đăng nhập
            </Link>
          )}
          <Link className="button button-small" href={primaryAction.href}>
            {primaryAction.label}
          </Link>
        </div>

        {currentUser ? <NotificationLink key={currentUser.id} /> : null}

        <details className="mobile-menu">
          <summary className="menu-button" aria-label="Mở menu">
            <Icon name="menu" />
          </summary>
          <nav aria-label="Điều hướng di động">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            {currentUser ? (
              <>
                <Link href="/tai-khoan/doi-mat-khau">Bảo mật tài khoản</Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit">Đăng xuất ({currentUser.name})</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/dang-nhap">Đăng nhập</Link>
                <Link href="/dang-ky">Đăng ký</Link>
              </>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
