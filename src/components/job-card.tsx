import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatSalary } from "@/lib/format";
import type { Job } from "@/types/job";

export function JobCard({ job, matchScore }: { job: Job; matchScore?: number }) {
  const score = matchScore ?? job.matchScore;

  return (
    <article className="job-card">
      <div className={`company-logo logo-${job.logoTone}`}>{job.logoText}</div>
      <div className="job-card-body">
        <div className="job-card-topline">
          <Link className="job-company-link" href={`/cong-ty/${job.companyId}`}>
            {job.company}
          </Link>
          <span className="job-card-badges">
            {score !== undefined && score > 0 ? (
              <span className="match-badge" title="Độ phù hợp với hồ sơ của bạn">
                {score}% phù hợp
              </span>
            ) : null}
            {job.featured ? <span className="featured-label">Nổi bật</span> : null}
          </span>
        </div>
        <Link className="job-title-link" href={`/viec-lam/${job.id}`}>
          {job.title}
        </Link>
        <div className="job-meta">
          <span>
            <Icon name="location" /> {job.location}
          </span>
          <span>
            <Icon name="briefcase" /> {job.workMode}
          </span>
        </div>
        <div className="job-card-footer">
          <div className="skill-list">
            {job.skills.slice(0, 3).map((skill) => (
              <span className="skill-tag" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          <strong className="salary">{formatSalary(job.salaryMin, job.salaryMax)}</strong>
        </div>
      </div>
    </article>
  );
}
