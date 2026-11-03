/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { blogHref } from "@/lib/blog";
import { s, safeSrc } from "@/lib/safe";
import type { PostCategoryRef } from "@/lib/types";
import PostMeta from "@/components/PostMeta";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const CRUMB_LINK = `inline-block rounded py-1 whitespace-nowrap hover:text-brand-700 hover:underline ${FOCUS_RING}`;

// Phần thân bài viết, dùng chung cho trang công khai và trang xem trước của admin
export default function PostArticle({
  post,
}: {
  post: {
    title: string;
    content: string;
    thumbnail_url: string | null;
    author_name: string | null;
    published_at: string | null;
    read_minutes: number;
    categories?: PostCategoryRef[];
  };
}) {
  const image = safeSrc(post.thumbnail_url);
  const categories = Array.isArray(post.categories) ? post.categories : [];

  return (
    <article className="max-w-[38rem] mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
      <nav aria-label="Đường dẫn">
        <ol className="flex items-center gap-2 text-sm text-gray-600">
          <li><Link href="/" className={CRUMB_LINK}>Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/blog" className={CRUMB_LINK}>Blog</Link></li>
          <li aria-hidden="true">/</li>
          <li className="min-w-0 truncate" aria-current="page">{post.title}</li>
        </ol>
      </nav>

      <header className="mt-6">
        {categories.length > 0 && (
          <p className="mb-2 flex flex-wrap gap-x-3 text-sm font-semibold text-brand-700">
            {categories.map((c) => (
              <Link key={c.slug} href={blogHref({ category: c.slug })} className={`rounded py-1 hover:underline ${FOCUS_RING}`}>
                {c.name}
              </Link>
            ))}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-gray-900 text-balance [overflow-wrap:anywhere]">
          {post.title}
        </h1>
        <div className="mt-4">
          <PostMeta author={post.author_name} publishedAt={post.published_at} readMinutes={post.read_minutes} />
        </div>
      </header>

      {image && (
        <img
          src={image}
          alt=""
          fetchPriority="high"
          className="mt-8 w-full aspect-video rounded-2xl object-cover bg-gray-100"
        />
      )}

      {/* API đã lọc HTML bằng HtmlSanitizer khi lưu */}
      <div className="rich-text mt-8 [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: s(post.content, 200000) }} />

      <Link
        href="/blog"
        className={`mt-10 inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6 6-6-6 6-6" />
        </svg>
        Xem tất cả bài viết
      </Link>
    </article>
  );
}
