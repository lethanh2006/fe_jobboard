"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { getUnreadCount, notificationsChangedEvent } from "@/lib/notification-api";

export function NotificationLink() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    let refreshQueued = false;
    async function refresh() {
      if (document.visibilityState === "hidden" || controller.signal.aborted) return;
      if (loading) {
        refreshQueued = true;
        return;
      }
      loading = true;
      try {
        const result = await getUnreadCount(undefined, controller.signal);
        if (!controller.signal.aborted) setCount(result.count);
      } catch {
        // Giữ lối vào hộp thông báo khi API tạm thời không khả dụng.
        if (!controller.signal.aborted) setCount(null);
      } finally {
        loading = false;
        if (refreshQueued) {
          refreshQueued = false;
          void refresh();
        }
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    window.addEventListener(notificationsChangedEvent, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(notificationsChangedEvent, refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [pathname]);

  const label = count === null ? "Thông báo" : `Thông báo, ${count} chưa đọc`;
  return (
    <Link className="notification-link" href="/thong-bao" aria-label={label} title={label}>
      <Icon name="bell" />
      {count !== null && count > 0 ? (
        <span className="notification-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>
      ) : null}
    </Link>
  );
}
