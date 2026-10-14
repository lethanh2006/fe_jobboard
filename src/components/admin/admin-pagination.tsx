import Link from "next/link";

/** Phân trang cho các bảng quản trị: giữ nguyên mọi tham số lọc, chỉ đổi `page`. */
export function AdminPagination({
  query,
  page,
  totalPages,
}: {
  query: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries({ ...query, page: target > 1 ? String(target) : undefined })) {
      if (value) {
        params.set(name, value);
      }
    }
    return `/quan-tri?${params}`;
  };

  return (
    <nav className="pagination admin-pagination" aria-label="Phân trang">
      {page > 1 ? <Link href={hrefFor(page - 1)}>Trước</Link> : <span aria-disabled="true">Trước</span>}
      <span className="pagination-info">
        Trang {page}/{totalPages}
      </span>
      {page < totalPages ? <Link href={hrefFor(page + 1)}>Sau</Link> : <span aria-disabled="true">Sau</span>}
    </nav>
  );
}
