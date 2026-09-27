import Link from "next/link";
import { Icon } from "@/components/icon";

export function SiteHeader() {
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
          <Link className="text-button" href="/dang-nhap">
            Đăng nhập
          </Link>
          <Link className="button button-small" href="/nha-tuyen-dung">
            Đăng tuyển
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
            <Link href="/dang-nhap">Đăng nhập</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
