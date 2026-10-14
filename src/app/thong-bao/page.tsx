import type { Metadata } from "next";
import { NotificationInbox, NotificationRetry } from "@/components/notification-inbox";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNotifications, getUnreadCount } from "@/lib/notification-api";
import { requireSession } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Thông báo", description: "Cập nhật tuyển dụng dành cho bạn." };

export default async function NotificationsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawPage = Number(params.page);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const unreadOnly = params.unreadOnly === "true";
  const returnPath = `/thong-bao?page=${page}${unreadOnly ? "&unreadOnly=true" : ""}`;
  const session = await requireSession(returnPath);
  const data = await Promise.all([
    getNotifications(page, unreadOnly, session.accessToken),
    getUnreadCount(session.accessToken),
  ]).catch(() => null);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="notifications-page shell">
        <div className="notifications-heading">
          <span className="section-kicker">Cập nhật dành cho bạn</span>
          <h1>Thông báo</h1>
          <p>Theo dõi đơn ứng tuyển, việc làm phù hợp và các cập nhật tuyển dụng.</p>
        </div>
        {data ? (
          <NotificationInbox key={`${page}-${unreadOnly}`} result={data[0]} unreadCount={data[1].count} unreadOnly={unreadOnly} />
        ) : (
          <div className="empty-state" role="alert">
            <h2>Chưa tải được thông báo</h2>
            <p>Kết nối đang gián đoạn. Vui lòng thử lại sau.</p>
            <NotificationRetry />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
