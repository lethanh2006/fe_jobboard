import Link from "next/link";
import type { JobMatch } from "@/types/job";

/** Độ phù hợp của ứng viên đang đăng nhập với một tin: điểm, kỹ năng đã có và còn thiếu. */
export function JobMatchCard({ match }: { match: JobMatch }) {
  const requiredCount = match.matchedSkills.length + match.missingSkills.length;

  return (
    <div className="match-card">
      <span className="section-kicker">Độ phù hợp của bạn</span>
      <div className="drawer-match">
        <div className="match-ring" style={{ ["--score" as string]: match.score }}>
          <strong>{match.score}%</strong>
        </div>
        <div>
          <strong>
            {requiredCount === 0
              ? "Tin không yêu cầu kỹ năng cụ thể"
              : `${match.matchedSkills.length}/${requiredCount} kỹ năng yêu cầu`}
          </strong>
          <span>
            {match.salaryFit
              ? "Mức lương mong muốn phù hợp với tin."
              : "Mức lương mong muốn chưa khớp khung của tin."}
          </span>
        </div>
      </div>
      {requiredCount > 0 ? (
        <div className="skill-list drawer-skills">
          {match.matchedSkills.map((skill) => (
            <span className="skill-tag skill-match" key={skill}>
              ✓ {skill}
            </span>
          ))}
          {match.missingSkills.map((skill) => (
            <span className="skill-tag skill-missing" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      ) : null}
      {match.missingSkills.length > 0 ? (
        <p className="match-hint">
          Bổ sung các kỹ năng nét đứt vào <Link href="/ung-vien/ho-so">hồ sơ</Link> nếu bạn đã có để tăng điểm phù hợp.
        </p>
      ) : null}
    </div>
  );
}
