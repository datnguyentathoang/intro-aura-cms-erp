import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/api";
import { blogPageHref, parsePage } from "@/lib/blog";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import SiteShell from "@/components/SiteShell";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

const DESCRIPTION = "Tin tức và kiến thức về quản lý kho, bán hàng và công nợ từ Aura.";
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const PAGER_LINK = `inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title: page > 1 ? `Blog - Trang ${page}` : "Blog",
    description: DESCRIPTION,
    alternates: { canonical: blogPageHref(page) },
    openGraph: { title: "Blog", description: DESCRIPTION, type: "website" },
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const { items, total, page_size } = await getBlogPosts(page);
  const totalPages = Math.ceil(total / page_size);

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <header className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Blog</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">{DESCRIPTION}</p>
        </header>

        {items.length > 0 ? (
          <ul className="mt-10 md:mt-12 grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post, i) => (
              <li key={post.slug} className={i === 0 ? "md:col-span-2 lg:col-span-3" : undefined}>
                <PostCard post={post} featured={i === 0} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 md:mt-12 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <svg className="mx-auto w-12 h-12 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {total > 0 ? "Trang này không có bài viết" : "Chưa có bài viết nào"}
            </h2>
            <p className="mt-2 text-gray-600">
              {total > 0 ? "Bạn có thể quay về trang đầu để xem các bài mới nhất." : "Các bài viết mới sẽ sớm được cập nhật tại đây."}
            </p>
            <Link href={total > 0 ? "/blog" : "/"} className={`mt-6 ${PAGER_LINK}`}>
              {total > 0 ? "Về trang đầu" : "Về trang chủ"}
            </Link>
          </div>
        )}

        {items.length > 0 && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} href={blogPageHref} />
        )}
      </section>
    </SiteShell>
  );
}
