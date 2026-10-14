"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { markAllNotificationsRead, markNotificationRead, notificationsChangedEvent } from "@/lib/notification-api";
import type { NotificationPage } from "@/types/notification";

export function NotificationRetry() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <button className="button button-small" type="button" disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}>
      {isPending ? "Đang tải..." : "Thử lại"}
    </button>
  );
}

export function NotificationInbox({ result, unreadCount, unreadOnly }: {
  result: NotificationPage;
  unreadCount: number;
  unreadOnly: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const hrefFor = (page: number) => `/thong-bao?page=${page}${unreadOnly ? "&unreadOnly=true" : ""}`;

  function update(work: () => Promise<void>, destination?: string) {
    if (isPending) return;
    setError("");
    startTransition(async () => {
      try {
        await work();
        window.dispatchEvent(new Event(notificationsChangedEvent));
        if (destination) router.push(destination);
        else if (unreadOnly && result.page > 1) router.replace("/thong-bao?unreadOnly=true");
        router.refresh();
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          router.push("/dang-nhap?redirect=%2Fthong-bao");
        }
        setError(cause instanceof Error ? cause.message : "Không thể cập nhật thông báo.");
      }
    });
  }

  return (
    <section className="notification-inbox" aria-label="Hộp thông báo" aria-busy={isPending}>
      <div className="notification-toolbar">
        <nav className="notification-filters" aria-label="Lọc thông báo">
          <Link href="/thong-bao" aria-current={!unreadOnly ? "page" : undefined}>Tất cả</Link>
          <Link href="/thong-bao?unreadOnly=true" aria-current={unreadOnly ? "page" : undefined}>
            Chưa đọc ({unreadCount})
          </Link>
        </nav>
        <button className="text-button" type="button" disabled={isPending || unreadCount === 0}
          onClick={() => update(markAllNotificationsRead)}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      {error ? <p className="notification-error" role="alert">{error}</p> : null}
      {result.items.length === 0 ? (
        <div className="empty-state">
          <span className="category-icon"><Icon name="bell" /></span>
          <h2>{unreadOnly ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo"}</h2>
          <p>Các cập nhật về tuyển dụng sẽ xuất hiện tại đây.</p>
          {result.page > 1 ? <Link className="inline-link" href={hrefFor(1)}>Về trang đầu</Link> : null}
        </div>
      ) : (
        <ul className="notification-list">
          {result.items.map((notification) => (
            <li key={notification.id} className={notification.read ? "notification-item" : "notification-item unread"}>
              <span className="notification-symbol"><Icon name={notification.type === "JobMatch" ? "sparkle" : "bell"} /></span>
              <div className="notification-content">
                {notification.link ? (
                  <Link className="notification-title" href={notification.link} onClick={(event) => {
                    if (notification.read || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
                    event.preventDefault();
                    update(() => markNotificationRead(notification.id), notification.link ?? undefined);
                  }}>{notification.title}</Link>
                ) : <strong className="notification-title">{notification.title}</strong>}
                {!notification.read ? <span className="sr-only"> (Chưa đọc)</span> : null}
                <p>{notification.body}</p>
                <time dateTime={notification.createdAt}>{formatDateTime(notification.createdAt)}</time>
              </div>
              {!notification.read ? (
                <button className="text-button notification-read" type="button" disabled={isPending}
                  aria-label={`Đánh dấu đã đọc: ${notification.title}`}
                  onClick={() => update(() => markNotificationRead(notification.id))}>
                  <Icon name="check" /><span>Đã đọc</span>
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {result.totalPages > 1 ? (
        <nav className="pagination" aria-label="Phân trang thông báo">
          {result.page > 1 ? <Link href={hrefFor(result.page - 1)}>Trước</Link> : <span aria-disabled="true">Trước</span>}
          <span className="pagination-info">Trang {result.page}/{result.totalPages}</span>
          {result.page < result.totalPages ? <Link href={hrefFor(result.page + 1)}>Sau</Link> : <span aria-disabled="true">Sau</span>}
        </nav>
      ) : null}
    </section>
  );
}
