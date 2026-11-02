/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatPostDate } from "@/lib/blog";
import { safeSrc } from "@/lib/safe";
import type { BlogPostCard } from "@/lib/types";

// featured = true: thẻ lớn nằm ngang (từ md trở lên), dùng cho bài đầu tiên của trang
export default function PostCard({ post, featured = false }: { post: BlogPostCard; featured?: boolean }) {
  const img = safeSrc(post.thumbnail_url);
  const date = formatPostDate(post.published_at);
  const categories = Array.isArray(post.categories) ? post.categories : [];
  // Thẻ lớn: ảnh phủ cả khung (absolute) để tỉ lệ ảnh không làm thay đổi chiều cao thẻ
  const media = featured ? "aspect-video md:absolute md:inset-0 md:aspect-auto md:h-full" : "aspect-video";

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-brand-200 focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 transition-shadow duration-200 motion-reduce:transition-none ${
        featured ? "grid md:grid-cols-2" : "flex flex-col"
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "md:min-h-80" : ""}`}>
        {img ? (
          <img
            src={img}
            alt=""
            loading={featured ? "eager" : "lazy"}
            className={`w-full ${media} object-cover bg-gray-100 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]`}
          />
        ) : (
          <div className={`w-full ${media} flex items-center justify-center bg-linear-to-br from-brand-50 to-accent-100 text-brand-400`} aria-hidden="true">
            <svg className={featured ? "w-16 h-16" : "w-10 h-10"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col min-w-0 ${featured ? "p-6 md:p-10" : "p-6"}`}>
        {categories.length > 0 && (
          <p className="mb-3 text-sm font-semibold text-brand-700">
            {categories.map((c) => c.name).join(" · ")}
          </p>
        )}
        <h2
          className={`font-bold text-gray-900 group-hover:text-brand-700 transition-colors duration-200 motion-reduce:transition-none [overflow-wrap:anywhere] text-balance ${
            featured ? "text-2xl md:text-3xl leading-tight" : "text-xl leading-snug"
          }`}
        >
          {/* after:inset-0 phủ link lên cả thẻ, chỉ cần một điểm dừng khi dùng phím Tab */}
          <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="outline-none after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className={`mt-3 text-base leading-relaxed text-gray-600 [overflow-wrap:anywhere] ${featured ? "line-clamp-4" : "line-clamp-3"}`}>
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <p className="flex flex-wrap gap-x-2 text-sm text-gray-600 tabular-nums min-w-0 [overflow-wrap:anywhere]">
            {post.author_name && <span>{post.author_name}</span>}
            {post.author_name && date && <span aria-hidden="true">·</span>}
            {date && <time dateTime={post.published_at ?? undefined}>{date}</time>}
            {(post.author_name || date) && <span aria-hidden="true">·</span>}
            <span>{post.read_minutes} phút đọc</span>
          </p>
          <svg
            className="w-5 h-5 shrink-0 text-brand-700 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </div>
      </div>
    </article>
  );
}
