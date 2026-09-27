import Link from "next/link";
import { Icon } from "@/components/icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-light" href="/">
            <span className="brand-mark">
              <Icon name="briefcase" />
            </span>
            <span>JobBoard</span>
          </Link>
          <p className="footer-note">
            Nơi công việc phù hợp gặp đúng người tài. Minh bạch, tập trung và
            không có tin tuyển dụng gây nhiễu.
          </p>
        </div>
        <div>
          <p className="footer-title">Dành cho ứng viên</p>
          <Link href="/viec-lam">Khám phá việc làm</Link>
          <Link href="/ung-vien/don-ung-tuyen">Theo dõi ứng tuyển</Link>
          <Link href="/">Cẩm nang nghề nghiệp</Link>
        </div>
        <div>
          <p className="footer-title">Dành cho doanh nghiệp</p>
          <Link href="/nha-tuyen-dung">Đăng tin tuyển dụng</Link>
          <Link href="/nha-tuyen-dung">Quản lý ứng viên</Link>
          <Link href="/">Bảng giá dịch vụ</Link>
        </div>
        <div>
          <p className="footer-title">JobBoard</p>
          <Link href="/">Về chúng tôi</Link>
          <Link href="/">Liên hệ</Link>
          <Link href="/">Điều khoản sử dụng</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 JobBoard. Made for better work.</span>
        <span>Việt Nam · Tiếng Việt</span>
      </div>
    </footer>
  );
}
