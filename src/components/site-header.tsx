import Link from "next/link";
import { Icon } from "@/components/icon";
import { getSession } from "@/lib/server-auth";
import type { AuthUser } from "@/types/auth";

export async function SiteHeader({ user }: { user?: AuthUser | null }) {
  const currentUser = user === undefined ? (await getSession())?.user ?? null : user;

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
          <Link href="/viec-lam">Việc làm</Link>
          <Link href="/ung-vien/don-ung-tuyen">Đơn ứng tuyển</Link>
          <Link href="/nha-tuyen-dung">Nhà tuyển dụng</Link>
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <>
              <span className="signed-in-user">{currentUser.name}</span>
              <form action="/api/auth/logout" method="post">
                <button className="text-button" type="submit">Đăng xuất</button>
              </form>
            </>
          ) : (
            <Link className="text-button" href="/dang-nhap">
              Đăng nhập
            </Link>
          )}
          <Link
            className="button button-small"
            href={currentUser?.role === "Candidate" ? "/ung-vien/ho-so" : "/nha-tuyen-dung"}
          >
            {currentUser?.role === "Candidate" ? "Hồ sơ của tôi" : "Đăng tuyển"}
          </Link>
        </div>

        <details className="mobile-menu">
          <summary className="menu-button" aria-label="Mở menu">
            <Icon name="menu" />
          </summary>
          <nav aria-label="Điều hướng di động">
            <Link href="/viec-lam">Việc làm</Link>
            <Link href="/ung-vien/don-ung-tuyen">Đơn ứng tuyển</Link>
            <Link href="/nha-tuyen-dung">Nhà tuyển dụng</Link>
            {currentUser ? (
              <form action="/api/auth/logout" method="post">
                <button type="submit">Đăng xuất ({currentUser.name})</button>
              </form>
            ) : (
              <Link href="/dang-nhap">Đăng nhập</Link>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
