"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import type { Job } from "@/types/job";

type JobSearchProps = {
  availableJobs: Job[];
  initialKeyword?: string;
  initialLocation?: string;
  initialCategory?: string;
};

const pageSize = 4;

export function JobSearch({
  availableJobs,
  initialKeyword = "",
  initialLocation = "",
  initialCategory = "",
}: JobSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);
  const [level, setLevel] = useState("");
  const [minimumSalary, setMinimumSalary] = useState(0);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi");
    const normalizedLocation = location.trim().toLocaleLowerCase("vi");

    return availableJobs
      .filter((job) => {
        const searchableText = [job.title, job.company, ...job.skills]
          .join(" ")
          .toLocaleLowerCase("vi");

        return (
          (!normalizedKeyword || searchableText.includes(normalizedKeyword)) &&
          (!normalizedLocation ||
            job.location.toLocaleLowerCase("vi").includes(normalizedLocation)) &&
          (!category || job.category.toLocaleLowerCase("vi").includes(category.toLocaleLowerCase("vi"))) &&
          (!level || job.level === level) &&
          job.salaryMin >= minimumSalary
        );
      })
      .sort((first, second) => {
        if (sort === "salary") {
          return second.salaryMax - first.salaryMax;
        }

        return second.postedAt.localeCompare(first.postedAt);
      });
  }, [availableJobs, category, keyword, level, location, minimumSalary, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleJobs = filteredJobs.slice((safePage - 1) * pageSize, safePage * pageSize);

  function updateFilter(update: () => void) {
    update();
    setPage(1);
  }

  function clearFilters() {
    setKeyword("");
    setLocation("");
    setCategory("");
    setLevel("");
    setMinimumSalary(0);
    setPage(1);
  }

  return (
    <>
      <div className="listing-search-panel">
        <label className="listing-search-field">
          <Icon name="search" />
          <span className="sr-only">Tìm theo từ khóa</span>
          <input
            value={keyword}
            onChange={(event) => updateFilter(() => setKeyword(event.target.value))}
            placeholder="Chức danh, kỹ năng hoặc công ty"
          />
        </label>
        <label className="listing-search-field">
          <Icon name="location" />
          <span className="sr-only">Tìm theo địa điểm</span>
          <input
            value={location}
            onChange={(event) => updateFilter(() => setLocation(event.target.value))}
            placeholder="Thành phố hoặc hình thức làm việc"
          />
        </label>
        <button className="button" type="button">
          <Icon name="search" /> Tìm kiếm
        </button>
      </div>

      <div className="job-browser">
        <aside className="filter-panel">
          <div className="filter-heading">
            <strong>Bộ lọc</strong>
            <button type="button" onClick={clearFilters}>
              Xóa tất cả
            </button>
          </div>

          <label className="filter-group">
            <span>Lĩnh vực</span>
            <select
              value={category}
              onChange={(event) => updateFilter(() => setCategory(event.target.value))}
            >
              <option value="">Tất cả lĩnh vực</option>
              <option value="Lập trình">Lập trình</option>
              <option value="Dữ liệu">Dữ liệu</option>
              <option value="Thiết kế">Thiết kế</option>
              <option value="DevOps">DevOps & Cloud</option>
              <option value="Kiểm thử">Kiểm thử phần mềm</option>
            </select>
          </label>

          <label className="filter-group">
            <span>Cấp bậc</span>
            <select
              value={level}
              onChange={(event) => updateFilter(() => setLevel(event.target.value))}
            >
              <option value="">Tất cả cấp bậc</option>
              <option value="Junior">Junior</option>
              <option value="Middle">Middle</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </label>

          <label className="filter-group">
            <span>Mức lương tối thiểu</span>
            <select
              value={minimumSalary}
              onChange={(event) =>
                updateFilter(() => setMinimumSalary(Number(event.target.value)))
              }
            >
              <option value={0}>Tất cả mức lương</option>
              <option value={1000}>Từ $1,000</option>
              <option value={1500}>Từ $1,500</option>
              <option value={2000}>Từ $2,000</option>
            </select>
          </label>

          <div className="filter-tip">
            <span className="mini-icon mint-icon">
              <Icon name="sparkle" />
            </span>
            <strong>Mẹo nhỏ</strong>
            <p>Thêm kỹ năng vào hồ sơ để nhận điểm phù hợp cho từng công việc.</p>
          </div>
        </aside>

        <section className="job-results" aria-live="polite">
          <div className="results-toolbar">
            <p>
              <strong>{filteredJobs.length}</strong> việc làm phù hợp
            </p>
            <label>
              <span>Sắp xếp:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="salary">Lương cao nhất</option>
              </select>
            </label>
          </div>

          {visibleJobs.length > 0 ? (
            <div className="job-result-list">
              {visibleJobs.map((job) => (
                <JobCard job={job} key={job.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="category-icon">
                <Icon name="search" />
              </span>
              <h2>Chưa tìm thấy công việc phù hợp</h2>
              <p>Thử bỏ bớt một vài bộ lọc hoặc tìm bằng từ khóa rộng hơn.</p>
              <button className="button button-small" type="button" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            </div>
          )}

          {filteredJobs.length > pageSize ? (
            <nav className="pagination" aria-label="Phân trang việc làm">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trước
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  className={safePage === pageNumber ? "active" : ""}
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage === pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Sau
              </button>
            </nav>
          ) : null}
        </section>
      </div>
    </>
  );
}
