import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { SaveJobButton } from "@/components/save-job-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSavedJobs } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/server-auth";
import { SavedJobsRetry } from "@/components/saved-jobs-retry";

export const metadata: Metadata = {
  title: "Việc làm đã lưu",
  description: "Các cơ hội bạn muốn quay lại ứng tuyển.",
};
const path = "/ung-vien/viec-lam-da-luu";
const labels = {
  Open: "Đang tuyển",
  Closed: "Tin đã đóng",
  Expired: "Đã hết hạn",
  Unavailable: "Tin không còn công khai",
};

export default async function SavedJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawPage = Number((await searchParams).page);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const returnPath = `${path}?page=${page}`;
  const session = await requireRole("Candidate", returnPath);
  const result = await getSavedJobs(page, session.accessToken).catch(() => null);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="saved-jobs-page shell">
        <div className="saved-jobs-heading">
          <span className="section-kicker">Không gian ứng viên</span>
          <h1>Việc làm đã lưu</h1>
          <p>Giữ lại những cơ hội bạn quan tâm và quay lại ứng tuyển khi sẵn sàng.</p>
          {result ? <span>{result.totalItems} việc làm đã lưu</span> : null}
        </div>
        {!result ? (
          <div className="empty-state" role="alert">
            <h2>Chưa tải được việc làm đã lưu</h2>
            <p>Vui lòng thử kết nối lại.</p>
            <SavedJobsRetry />
          </div>
        ) : result.items.length === 0 ? (
          <div className="empty-state">
            <span className="category-icon">
              <Icon name="bookmark" />
            </span>
            <h2>{page > 1 ? "Không có việc làm ở trang này" : "Bạn chưa lưu việc làm nào"}</h2>
            <p>Bấm “Lưu việc làm” tại danh sách hoặc trang chi tiết để xem lại ở đây.</p>
            <Link className="button button-small" href={page > 1 ? path : "/viec-lam"}>
              {page > 1 ? "Về trang đầu" : "Khám phá việc làm"}
            </Link>
          </div>
        ) : (
          <div className="saved-jobs-list">
            {result.items.map((item) => {
              const button = (
                <SaveJobButton
                  key={item.jobId}
                  jobId={item.jobId}
                  initialSaved
                  returnPath={returnPath}
                  afterRemovePath={
                    result.items.length === 1 && page > 1 ? `${path}?page=${page - 1}` : returnPath
                  }
                />
              );
              return (
                <section
                  className="saved-job-entry"
                  key={item.jobId}
                  aria-label={item.job?.title ?? `Tin đã lưu #${item.jobId}`}
                >
                  <div className="saved-job-meta">
                    <span className={`saved-job-status status-${item.availability.toLowerCase()}`}>
                      {labels[item.availability]}
                    </span>
                    <time dateTime={item.savedAt}>Đã lưu {formatDateTime(item.savedAt)}</time>
                  </div>
                  {item.job ? (
                    <JobCard job={item.job} saveControl={button} />
                  ) : (
                    <div className="saved-job-unavailable">
                      <div>
                        <h2>Tin tuyển dụng không còn công khai</h2>
                        <p>Bạn vẫn có thể bỏ lưu tin này hoặc tìm cơ hội khác.</p>
                      </div>
                      {button}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
        {result && result.totalPages > 1 ? (
          <nav className="pagination" aria-label="Phân trang việc làm đã lưu">
            {page > 1 ? (
              <Link href={`${path}?page=${page - 1}`}>Trước</Link>
            ) : (
              <span aria-disabled="true">Trước</span>
            )}
            <span className="pagination-info">
              Trang {page}/{result.totalPages}
            </span>
            {page < result.totalPages ? (
              <Link href={`${path}?page=${page + 1}`}>Sau</Link>
            ) : (
              <span aria-disabled="true">Sau</span>
            )}
          </nav>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
