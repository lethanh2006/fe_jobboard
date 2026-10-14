"use client";

import Form from "next/form";
import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";
import { Icon } from "@/components/icon";
import type { JobFilters } from "@/lib/job-filters";
import { jobLevelOptions } from "@/lib/job-options";

type JobSearchFormProps = {
  filters: JobFilters;
  categories: { value: string; label: string }[];
  totalItems: number;
  /** Danh sách kết quả và phân trang do server render. */
  children: ReactNode;
};

const salaryOptions = [0, 1000, 1500, 2000, 3000];

/**
 * Bộ lọc là một form GET: mỗi lần gửi sẽ đổi query trên URL và server tìm lại.
 * Chọn ở ô select tự gửi ngay; ô nhập chữ gửi khi bấm Enter hoặc nút Tìm kiếm.
 */
export function JobSearchForm({ filters, categories, totalItems, children }: JobSearchFormProps) {
  function submitOnSelectChange(event: ChangeEvent<HTMLFormElement>) {
    if (event.target instanceof HTMLSelectElement) {
      event.currentTarget.requestSubmit();
    }
  }

  return (
    <Form action="/viec-lam" onChange={submitOnSelectChange}>
      <div className="listing-search-panel">
        <label className="listing-search-field">
          <Icon name="search" />
          <span className="sr-only">Tìm theo từ khóa</span>
          <input
            name="keyword"
            defaultValue={filters.keyword}
            maxLength={200}
            placeholder="Chức danh, kỹ năng hoặc công ty"
          />
        </label>
        <label className="listing-search-field">
          <Icon name="location" />
          <span className="sr-only">Tìm theo địa điểm</span>
          <input
            name="location"
            defaultValue={filters.location}
            maxLength={200}
            placeholder="Thành phố hoặc khu vực"
          />
        </label>
        <button className="button" type="submit">
          <Icon name="search" /> Tìm kiếm
        </button>
      </div>

      <div className="job-browser">
        <aside className="filter-panel">
          <div className="filter-heading">
            <strong>Bộ lọc</strong>
            <Link href="/viec-lam">Xóa tất cả</Link>
          </div>

          <label className="filter-group">
            <span>Lĩnh vực</span>
            <select name="category" defaultValue={filters.category ?? ""}>
              <option value="">Tất cả lĩnh vực</option>
              {categories.map((category) => (
                <option value={category.value} key={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-group">
            <span>Cấp bậc</span>
            <select name="level" defaultValue={filters.level ?? ""}>
              <option value="">Tất cả cấp bậc</option>
              {jobLevelOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-group">
            <span>Mức lương tối thiểu</span>
            <select name="minimumSalary" defaultValue={filters.minimumSalary ?? 0}>
              {salaryOptions.map((salary) => (
                <option value={salary} key={salary}>
                  {salary === 0 ? "Tất cả mức lương" : `Từ $${salary.toLocaleString("en-US")}`}
                </option>
              ))}
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
              <strong>{totalItems}</strong> việc làm phù hợp
            </p>
            <label>
              <span>Sắp xếp:</span>
              <select name="sort" defaultValue={filters.sort}>
                <option value="Newest">Mới nhất</option>
                <option value="SalaryDescending">Lương cao nhất</option>
              </select>
            </label>
          </div>
          {children}
        </section>
      </div>
    </Form>
  );
}
