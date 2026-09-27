import type { Metadata } from "next";
import { JobSearch } from "@/components/job-search";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tìm việc làm",
  description: "Tìm kiếm và lọc các cơ hội việc làm phù hợp trên JobBoard.",
};

type JobsPageProps = {
  searchParams: Promise<{
    keyword?: string;
    location?: string;
    category?: string;
  }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="listing-page">
        <section className="listing-hero">
          <div className="shell">
            <span className="section-kicker">Cơ hội dành cho bạn</span>
            <h1>Tìm công việc tiếp theo</h1>
            <p>Khám phá những đội ngũ, thử thách và môi trường phù hợp với bạn.</p>
          </div>
        </section>
        <div className="shell listing-content">
          <JobSearch
            initialKeyword={filters.keyword}
            initialLocation={filters.location}
            initialCategory={filters.category}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
