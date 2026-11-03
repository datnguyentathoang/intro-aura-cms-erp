import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogCategories, getBlogPosts } from "@/lib/api";
import { blogHref, parseBlogQuery, type BlogLayout, type BlogQuery } from "@/lib/blog";
import type { BlogCategory, BlogPostCard } from "@/lib/types";
import { BlogCategories, BlogLayoutSwitch, BlogSearch } from "@/components/BlogControls";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import SiteShell from "@/components/SiteShell";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const DESCRIPTION = "Tin tức và kiến thức về quản lý kho, bán hàng và công nợ từ Aura.";
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const PAGER_LINK = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`;

// Chuyên mục không tồn tại thì báo 404. Không lấy được danh sách chuyên mục thì bỏ qua bước kiểm tra
function activeCategory(categories: BlogCategory[], query: BlogQuery) {
  if (!query.category || categories.length === 0) return undefined;
  const found = categories.find((c) => c.slug === query.category);
  if (!found) notFound();
  return found;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseBlogQuery(await searchParams);
  const active = activeCategory(await getBlogCategories(), query);
  const name = active?.name ?? "Blog";
  const description = active?.description ?? DESCRIPTION;
  return {
    title: query.q ? `Tìm kiếm: ${query.q}` : query.page > 1 ? `${name} - Trang ${query.page}` : name,
    description,
    // Kết quả tìm kiếm không cần lập chỉ mục; layout chỉ đổi cách hiển thị nên không nằm trong canonical
    robots: query.q ? { index: false, follow: true } : undefined,
    alternates: { canonical: blogHref({ category: query.category, page: query.page }) },
    openGraph: { title: name, description, type: "website" },
  };
}

function PostList({ items, layout }: { items: BlogPostCard[]; layout: BlogLayout }) {
  if (layout === "sidebar") {
    return (
      <ul className="grid gap-6 sm:grid-cols-2">
        {items.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    );
  }
  if (layout === "standard") {
    return (
      <ul className="mx-auto max-w-3xl space-y-8">
        {items.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} large />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.map((post, i) => (
        <li key={post.slug} className={i === 0 ? "md:col-span-2 lg:col-span-3" : undefined}>
          <PostCard post={post} featured={i === 0} />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ query, total }: { query: BlogQuery; total: number }) {
  const { q, category, layout } = query;
  const content =
    total > 0
      ? { title: "Trang này không có bài viết", text: "Bạn có thể quay về trang đầu để xem các bài mới nhất.", href: blogHref({ ...query, page: 1 }), link: "Về trang đầu" }
      : q
        ? { title: "Không tìm thấy bài viết phù hợp", text: "Hãy thử từ khoá khác và gõ đủ dấu tiếng Việt, ví dụ “tồn kho”.", href: blogHref({ layout }), link: "Xem tất cả bài viết" }
        : category
          ? { title: "Chuyên mục này chưa có bài viết", text: "Các bài viết mới sẽ sớm được cập nhật tại đây.", href: blogHref({ layout }), link: "Xem tất cả bài viết" }
          : { title: "Chưa có bài viết nào", text: "Các bài viết mới sẽ sớm được cập nhật tại đây.", href: "/", link: "Về trang chủ" };
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
      <svg className="mx-auto w-12 h-12 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">{content.title}</h2>
      <p className="mt-2 text-gray-600">{content.text}</p>
      <Link href={content.href} className={`mt-6 ${PAGER_LINK}`}>{content.link}</Link>
    </div>
  );
}

export default async function BlogPage({ searchParams }: Props) {
  const query = parseBlogQuery(await searchParams);
  const [{ items, total, page_size }, categories] = await Promise.all([getBlogPosts(query), getBlogCategories()]);
  const active = activeCategory(categories, query);
  const totalPages = Math.ceil(total / page_size);
  const sidebar = query.layout === "sidebar";

  const results = (
    <>
      {items.length > 0 ? <PostList items={items} layout={query.layout} /> : <EmptyState query={query} total={total} />}
      {items.length > 0 && totalPages > 1 && (
        <Pagination page={query.page} totalPages={totalPages} href={(page) => blogHref({ ...query, page })} />
      )}
    </>
  );

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl min-w-0">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">{active?.name ?? "Blog"}</h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{active?.description ?? DESCRIPTION}</p>
          </div>
          <BlogLayoutSwitch query={query} />
        </header>

        {!sidebar && (
          <div className="mt-8 space-y-4">
            <div className="max-w-md">
              <BlogSearch query={query} />
            </div>
            <BlogCategories categories={categories} query={query} />
          </div>
        )}

        {(query.q || query.category) && (
          <p className="mt-6 flex flex-wrap items-center gap-x-3 text-sm text-gray-600 [overflow-wrap:anywhere]">
            <span className="min-w-0">{query.q ? `${total} kết quả cho “${query.q}”` : `${total} bài viết`}</span>
            <Link href={blogHref({ layout: query.layout })} className={`rounded py-1 font-medium text-brand-700 underline ${FOCUS_RING}`}>
              Xoá bộ lọc
            </Link>
          </p>
        )}

        {sidebar ? (
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0">{results}</div>
            <aside className="order-first space-y-6 lg:order-last lg:sticky lg:top-32">
              <BlogSearch query={query} />
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Chuyên mục</h2>
                <BlogCategories categories={categories} query={query} vertical />
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8">{results}</div>
        )}
      </section>
    </SiteShell>
  );
}
