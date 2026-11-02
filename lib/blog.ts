const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatPostDate(v: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : dateFormat.format(d);
}

// Tham số ?page= do người dùng nhập: giá trị không hợp lệ thì về trang 1
export function parsePage(v: string | string[] | undefined): number {
  return typeof v === "string" && /^[1-9]\d{0,5}$/.test(v) ? Number(v) : 1;
}

export function blogPageHref(page: number): string {
  return page > 1 ? `/blog?page=${page}` : "/blog";
}

// Các số trang cần hiện: trang đầu, trang cuối và các trang cách trang hiện tại tối đa radius; null là dấu "…"
export function pageWindow(page: number, totalPages: number, radius: number): (number | null)[] {
  const out: (number | null)[] = [];
  let last = 0;
  for (let p = 1; p <= totalPages; p++) {
    if (p !== 1 && p !== totalPages && Math.abs(p - page) > radius) continue;
    // Chỉ thiếu đúng một trang thì hiện luôn số đó, vì "…" không ngắn gọn hơn
    if (p - last === 2) out.push(p - 1);
    else if (p - last > 2) out.push(null);
    out.push(p);
    last = p;
  }
  return out;
}
