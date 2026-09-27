import Link from "next/link";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categories, jobs } from "@/data/jobs";

const trustedCompanies = ["NOVA", "LUMI", "CLOUDNINE", "MƠ LAB", "FINORA"];

export default function HomePage() {
  const featuredJobs = jobs.filter((job) => job.featured);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-section">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="shell hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <Icon name="sparkle" />
                Cơ hội mới mỗi ngày
              </div>
              <h1>
                Công việc tốt.
                <br />
                <span>Sự nghiệp đúng hướng.</span>
              </h1>
              <p>
                Khám phá cơ hội từ những đội ngũ tử tế và xây dựng hành trình
                nghề nghiệp theo cách của riêng bạn.
              </p>

              <form className="hero-search" action="/viec-lam">
                <label className="search-field">
                  <Icon name="search" />
                  <span className="sr-only">Từ khóa</span>
                  <input name="keyword" placeholder="Vị trí, kỹ năng hoặc công ty" />
                </label>
                <span className="search-divider" />
                <label className="search-field search-location">
                  <Icon name="location" />
                  <span className="sr-only">Địa điểm</span>
                  <input name="location" placeholder="Địa điểm" />
                </label>
                <button className="button search-submit" type="submit">
                  Tìm việc ngay
                </button>
              </form>

              <div className="popular-searches">
                <span>Đang được tìm nhiều:</span>
                <Link href="/viec-lam?keyword=React">React</Link>
                <Link href="/viec-lam?keyword=.NET">.NET</Link>
                <Link href="/viec-lam?keyword=Data">Data</Link>
                <Link href="/viec-lam?keyword=Product">Product</Link>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-backdrop" />
              <div className="candidate-card candidate-card-main">
                <div className="avatar avatar-main">AN</div>
                <div>
                  <strong>Nguyễn An</strong>
                  <span>Backend Developer</span>
                </div>
                <span className="match-score">94% phù hợp</span>
              </div>
              <div className="candidate-card candidate-card-top">
                <span className="mini-icon mint-icon">
                  <Icon name="check" />
                </span>
                <div>
                  <strong>Hồ sơ nổi bật</strong>
                  <span>Top 5% ứng viên tuần này</span>
                </div>
              </div>
              <div className="candidate-card candidate-card-bottom">
                <span className="mini-icon coral-icon">
                  <Icon name="briefcase" />
                </span>
                <div>
                  <strong>328 việc làm mới</strong>
                  <span>Được cập nhật hôm nay</span>
                </div>
              </div>
              <div className="visual-dots" />
            </div>
          </div>

          <div className="shell trust-row">
            <span>Được tin dùng bởi các đội ngũ tại</span>
            <div className="company-strip">
              {trustedCompanies.map((company) => (
                <strong key={company}>{company}</strong>
              ))}
            </div>
          </div>
        </section>

        <section className="section shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Khám phá theo lĩnh vực</span>
              <h2>Tìm nơi bạn có thể tỏa sáng</h2>
            </div>
            <Link className="arrow-link" href="/viec-lam">
              Xem tất cả lĩnh vực <Icon name="arrow" />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                className="category-card"
                href={`/viec-lam?category=${encodeURIComponent(category.name)}`}
                key={category.name}
              >
                <span className="category-icon">
                  <Icon name={category.icon} />
                </span>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.count} vị trí đang tuyển</span>
                </div>
                <Icon className="category-arrow" name="arrow" />
              </Link>
            ))}
          </div>
        </section>

        <section className="section featured-section">
          <div className="shell">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Được tuyển chọn</span>
                <h2>Việc làm nổi bật</h2>
              </div>
              <Link className="arrow-link" href="/viec-lam">
                Xem mọi việc làm <Icon name="arrow" />
              </Link>
            </div>
            <div className="featured-grid">
              {featuredJobs.map((job) => (
                <JobCard job={job} key={job.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="section shell">
          <div className="employer-cta">
            <div className="cta-pattern" />
            <div className="cta-copy">
              <span className="cta-label">Dành cho nhà tuyển dụng</span>
              <h2>Tìm đúng người, xây đội ngũ mạnh.</h2>
              <p>
                Tiếp cận ứng viên phù hợp, quản lý quy trình tuyển dụng gọn gàng
                và minh bạch trên một nền tảng.
              </p>
              <Link className="button button-light" href="/nha-tuyen-dung">
                Bắt đầu đăng tuyển <Icon name="arrow" />
              </Link>
            </div>
            <div className="cta-stats">
              <div>
                <strong>12K+</strong>
                <span>Ứng viên chất lượng</span>
              </div>
              <div>
                <strong>86%</strong>
                <span>Tin tuyển dụng có hồ sơ trong 7 ngày</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
