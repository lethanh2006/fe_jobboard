export const adminTabs = [
  { slug: "tong-quan", label: "Tổng quan" },
  { slug: "tin", label: "Tin tuyển dụng" },
  { slug: "cong-ty", label: "Công ty" },
  { slug: "nguoi-dung", label: "Tài khoản" },
  { slug: "nhat-ky", label: "Nhật ký" },
] as const;

export type AdminTabSlug = (typeof adminTabs)[number]["slug"];

type RawParams = Record<string, string | string[] | undefined>;

export const firstParam = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export function parseAdminTab(raw: RawParams): AdminTabSlug {
  const tab = firstParam(raw.tab);
  return adminTabs.find((item) => item.slug === tab)?.slug ?? "tong-quan";
}

export function parsePage(raw: RawParams) {
  const page = Number(firstParam(raw.page));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Chỉ giữ giá trị nằm trong danh sách cho phép; giá trị lạ bị bỏ để API không trả 400. */
export function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]) {
  return allowed.find((item) => item === value);
}
