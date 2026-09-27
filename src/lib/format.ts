export function formatSalary(min: number, max: number) {
  return `$${min.toLocaleString("en-US")} – $${max.toLocaleString("en-US")}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`));
}
