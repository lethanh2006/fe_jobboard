import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { JobCard } from "@/components/job-card";
import { JobPagination } from "@/components/job-pagination";
import { JobSearchForm } from "@/components/job-search-form";
import { SaveJobButton } from "@/components/save-job-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCategories, getJobMatches, getSavedJobIds, searchJobs } from "@/lib/api";
import {
  buildJobsHref,
  categoryOptions,
  parseJobFilters,
  toSearchParams,
} from "@/lib/job-filters";
import { getSession } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Tìm việc làm",
  description: "Tìm kiếm và lọc các cơ hội việc làm phù hợp trên JobBoard.",
};

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = parseJobFilters(await searchParams);
  const [session, categories, result] = await Promise.all([
    getSession(),
    getCategories(),
    searchJobs(toSearchParams(filters)).catch(() => null),
  ]);

  // Ứng viên đăng nhập thấy độ phù hợp và trạng thái lưu trên từng thẻ; mỗi phần một request cho
  // cả trang kết quả, và lỗi ở các phần phụ này không làm hỏng danh sách.
  const candidate = session?.user.role === "Candidate" ? session : null;
  const jobIds = result?.items.map((job) => job.id) ?? [];
  const [matches, savedIds] = await Promise.all([
    candidate && result
      ? getJobMatches(candidate.user.id, jobIds, candidate.accessToken).catch(() => [])
      : [],
    candidate && result
      ? getSavedJobIds(jobIds, candidate.accessToken).catch(() => null)
      : ([] as number[]),
  ]);
  const returnPath = buildJobsHref(filters);
  const scoreByJob = new Map(matches.map((match) => [match.jobId, match.score]));

  return (
    <>
      <SiteHeader user={session?.user ?? null} />
      <main className="listing-page">
        <section className="listing-hero">
          <div className="shell">
            <span className="section-kicker">Cơ hội dành cho bạn</span>
            <h1>Tìm công việc tiếp theo</h1>
            <p>Khám phá những đội ngũ, thử thách và môi trường phù hợp với bạn.</p>
          </div>
        </section>
        <div className="shell listing-content">
          <JobSearchForm
            key={buildJobsHref(filters, { page: 1 })}
            filters={filters}
            categories={categoryOptions(categories, filters.category)}
            totalItems={result?.totalItems ?? 0}
          >
            {!result ? (
              <EmptyState
                title="Không thể tìm kiếm lúc này"
                description="Vui lòng thử lại sau ít phút."
              />
            ) : result.items.length > 0 ? (
              <>
                <div className="job-result-list">
                  {result.items.map((job) => (
                    <JobCard
                      job={job}
                      matchScore={scoreByJob.get(job.id)}
                      key={job.id}
                      saveControl={
                        !session || candidate ? (
                          <SaveJobButton
                            // Gắn lại khi dữ liệu server đổi (sau router.refresh) để trạng thái luôn khớp.
                            key={`${job.id}-${savedIds?.includes(job.id)}`}
                            jobId={job.id}
                            initialSaved={savedIds === null ? null : savedIds.includes(job.id)}
                            guest={!session}
                            returnPath={returnPath}
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </div>
                <JobPagination filters={filters} totalPages={result.totalPages} />
              </>
            ) : result.totalItems > 0 ? (
              <EmptyState
                title="Không có kết quả ở trang này"
                description="Trang bạn chọn nằm ngoài danh sách kết quả."
                href={buildJobsHref(filters, { page: 1 })}
                action="Về trang đầu"
              />
            ) : (
              <EmptyState
                title="Chưa tìm thấy công việc phù hợp"
                description="Thử bỏ bớt một vài bộ lọc hoặc tìm bằng từ khóa rộng hơn."
                href="/viec-lam"
                action="Xóa bộ lọc"
              />
            )}
          </JobSearchForm>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <span className="category-icon">
        <Icon name="search" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {href && action ? (
        <Link className="button button-small" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}
