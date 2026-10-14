import Link from "next/link";
import { buildJobsHref, type JobFilters } from "@/lib/job-filters";

/** Các số trang cần hiển thị: đầu, cuối và vùng quanh trang hiện tại; `null` là dấu “…”. */
function visiblePages(current: number, total: number): (number | null)[] {
  const wanted = new Set(
    [1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total),
  );
  const pages: (number | null)[] = [];
  let previous = 0;

  for (const page of [...wanted].sort((a, b) => a - b)) {
    if (page - previous > 1) {
      pages.push(null);
    }
    pages.push(page);
    previous = page;
  }

  return pages;
}

export function JobPagination({ filters, totalPages }: { filters: JobFilters; totalPages: number }) {
  if (totalPages <= 1) {
    return null;
  }

  const current = Math.min(filters.page, totalPages);

  return (
    <nav className="pagination" aria-label="Phân trang việc làm">
      {current > 1 ? (
        <Link href={buildJobsHref(filters, { page: current - 1 })} rel="prev">
          Trước
        </Link>
      ) : (
        <span aria-disabled="true">Trước</span>
      )}
      {visiblePages(current, totalPages).map((page, index) =>
        page === null ? (
          <span className="pagination-gap" key={`gap-${index}`}>
            …
          </span>
        ) : (
          <Link
            className={page === current ? "active" : undefined}
            aria-current={page === current ? "page" : undefined}
            href={buildJobsHref(filters, { page })}
            key={page}
          >
            {page}
          </Link>
        ),
      )}
      {current < totalPages ? (
        <Link href={buildJobsHref(filters, { page: current + 1 })} rel="next">
          Sau
        </Link>
      ) : (
        <span aria-disabled="true">Sau</span>
      )}
    </nav>
  );
}
