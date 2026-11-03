import Form from "next/form";
import Link from "next/link";
import { blogHref, type BlogLayout, type BlogQuery } from "@/lib/blog";
import type { BlogCategory } from "@/lib/types";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const FADE = "transition-colors duration-200 motion-reduce:transition-none";

// Form GET: chạy được cả khi chưa có JavaScript. Tìm kiếm mới luôn về trang 1, giữ chuyên mục và layout đang chọn
export function BlogSearch({ query }: { query: BlogQuery }) {
  return (
    <Form action="/blog" role="search" className="flex gap-2">
      {query.category && <input type="hidden" name="category" value={query.category} />}
      {query.layout !== "grid" && <input type="hidden" name="layout" value={query.layout} />}
      <label htmlFor="blog-search" className="sr-only">Tìm bài viết</label>
      <input
        key={query.q}
        id="blog-search"
        type="search"
        name="q"
        defaultValue={query.q}
        maxLength={100}
        placeholder="Tìm bài viết..."
        className="min-h-11 w-full min-w-0 rounded-xl border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button className={`min-h-11 shrink-0 cursor-pointer rounded-xl bg-brand-700 px-5 text-sm font-medium text-white hover:bg-brand-800 ${FADE} ${FOCUS_RING}`}>
        Tìm
      </button>
    </Form>
  );
}

function CategoryLink({
  href,
  current,
  count,
  children,
}: {
  href: string;
  current: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-4 text-sm font-medium ${FADE} ${FOCUS_RING} ${
        current ? "border-brand-700 bg-brand-700 text-white" : "border-gray-300 text-gray-800 hover:bg-gray-100"
      }`}
    >
      {children}
      {count !== undefined && <span className={`tabular-nums ${current ? "text-white" : "text-gray-600"}`}>{count}</span>}
    </Link>
  );
}

// vertical: từ màn hình lớn xếp thành cột, dùng trong thanh bên
export function BlogCategories({
  categories,
  query,
  vertical = false,
}: {
  categories: BlogCategory[];
  query: BlogQuery;
  vertical?: boolean;
}) {
  const visible = categories.filter((c) => c.post_count > 0 || c.slug === query.category);
  if (visible.length === 0) return null;
  const { q, layout } = query;
  return (
    <nav aria-label="Chuyên mục">
      <ul className={`flex flex-wrap gap-2 ${vertical ? "lg:flex-col" : ""}`}>
        <li>
          <CategoryLink href={blogHref({ q, layout })} current={!query.category}>Tất cả</CategoryLink>
        </li>
        {visible.map((c) => (
          <li key={c.slug}>
            <CategoryLink href={blogHref({ category: c.slug, q, layout })} current={c.slug === query.category} count={c.post_count}>
              {c.name}
            </CategoryLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const LAYOUTS: { id: BlogLayout; label: string; icon: string }[] = [
  { id: "grid", label: "Lưới", icon: "M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 15h6v4H4v-4zm10 0h6v4h-6v-4z" },
  { id: "sidebar", label: "Thanh bên", icon: "M4 5h16v14H4V5zm11 0v14" },
  { id: "standard", label: "Danh sách", icon: "M4 6h16M4 12h16M4 18h16" },
];

// Chỉ hiện từ màn hình vừa trở lên: trên điện thoại cả ba layout đều là một cột
export function BlogLayoutSwitch({ query }: { query: BlogQuery }) {
  return (
    <nav aria-label="Kiểu hiển thị" className="hidden md:flex shrink-0 gap-1 rounded-xl border border-gray-200 p-1">
      {LAYOUTS.map((l) => {
        const current = l.id === query.layout;
        return (
          <Link
            key={l.id}
            href={blogHref({ ...query, layout: l.id })}
            rel="nofollow"
            aria-current={current ? "true" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium ${FADE} ${FOCUS_RING} ${
              current ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={l.icon} />
            </svg>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
