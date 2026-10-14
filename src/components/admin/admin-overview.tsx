import Link from "next/link";
import { Icon } from "@/components/icon";
import { getAdminStats } from "@/lib/admin-api";

export async function AdminOverview({ accessToken }: { accessToken: string }) {
  const stats = await getAdminStats(accessToken);
  const cards = [
    { icon: "users", tone: "sky", value: stats.users.candidates, label: "Ứng viên" },
    { icon: "briefcase", tone: "mint", value: stats.users.employers, label: "Tài khoản nhà tuyển dụng" },
    { icon: "check", tone: "mint", value: stats.companies.active, label: "Công ty hoạt động" },
    { icon: "clock", tone: "coral", value: stats.companies.suspended, label: "Công ty bị khóa" },
    { icon: "briefcase", tone: "mint", value: stats.jobs.published, label: "Tin đang đăng" },
    { icon: "pen", tone: "amber", value: stats.jobs.draft, label: "Tin bản nháp" },
    { icon: "clock", tone: "coral", value: stats.jobs.removed, label: "Tin bị gỡ" },
    { icon: "chart", tone: "sky", value: stats.applications, label: "Đơn ứng tuyển" },
  ] as const;

  return (
    <>
      <section className="employer-stats admin-stats">
        {cards.map((card) => (
          <article className="dashboard-stat" key={card.label}>
            <span className={`stat-icon stat-${card.tone}`}>
              <Icon name={card.icon} />
            </span>
            <div>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </div>
          </article>
        ))}
      </section>
      <section className="admin-shortcuts">
        <Link href="/quan-tri?tab=tin&status=Published">Duyệt tin đang đăng →</Link>
        <Link href="/quan-tri?tab=cong-ty&status=Suspended">Công ty đang bị khóa →</Link>
        <Link href="/quan-tri?tab=nguoi-dung&disabled=true">Tài khoản đang bị khóa →</Link>
        <Link href="/quan-tri?tab=nhat-ky">Nhật ký thao tác →</Link>
      </section>
    </>
  );
}
