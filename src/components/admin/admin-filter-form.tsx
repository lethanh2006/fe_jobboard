"use client";

import Form from "next/form";
import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";

/** Form GET giữ nguyên tab hiện tại; chọn ở ô select tự gửi, ô chữ gửi khi bấm Enter/Lọc. */
export function AdminFilterForm({
  tab,
  hidden,
  children,
}: {
  tab: string;
  /** Giá trị cần giữ khi lọc (ví dụ mã công ty đang xem). */
  hidden?: Record<string, string | undefined>;
  children: ReactNode;
}) {
  function submitOnSelectChange(event: ChangeEvent<HTMLFormElement>) {
    if (event.target instanceof HTMLSelectElement) {
      event.currentTarget.requestSubmit();
    }
  }

  return (
    <Form action="/quan-tri" className="table-toolbar admin-filters" onChange={submitOnSelectChange}>
      <input type="hidden" name="tab" value={tab} />
      {Object.entries(hidden ?? {}).map(([name, value]) =>
        value ? <input type="hidden" name={name} value={value} key={name} /> : null,
      )}
      {children}
      <button className="button button-small" type="submit">
        Lọc
      </button>
      <Link className="text-button" href={`/quan-tri?tab=${tab}`}>
        Xóa lọc
      </Link>
    </Form>
  );
}
