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

export type BlogLayout = "grid" | "sidebar" | "standard";
export type BlogQuery = { page: number; category: string; q: string; layout: BlogLayout };

// Tham số URL của /blog do người dùng nhập: giá trị không hợp lệ thì dùng mặc định
export function parseBlogQuery(params: Record<string, string | string[] | undefined>): BlogQuery {
  const text = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
  const category = text(params.category).toLowerCase();
  const layout = text(params.layout);
  return {
    page: parsePage(params.page),
    category: category.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) ? category : "",
    q: text(params.q).slice(0, 100),
    layout: layout === "sidebar" || layout === "standard" ? layout : "grid",
  };
}

// Link tới /blog, bỏ các tham số đang ở giá trị mặc định
export function blogHref(query: Partial<BlogQuery> = {}): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.layout && query.layout !== "grid") params.set("layout", query.layout);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
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
