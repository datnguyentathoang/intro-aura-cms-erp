/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { safeSrc } from "@/lib/safe";
import type { BlogPostCard, BlogRelatedPost } from "@/lib/types";
import PostMeta from "@/components/PostMeta";

// featured = true: thẻ lớn nằm ngang (từ md trở lên), dùng cho bài đầu tiên của trang
// large = true: thẻ dọc nhưng tiêu đề lớn hơn, dùng cho layout danh sách một cột
// titleAs: cấp tiêu đề của thẻ, để không nhảy cấp khi thẻ nằm dưới một h2 khác
export default function PostCard({
  post,
  featured = false,
  large = false,
  titleAs: Title = "h2",
}: {
  post: BlogRelatedPost & Partial<BlogPostCard>;
  featured?: boolean;
  large?: boolean;
  titleAs?: "h2" | "h3";
}) {
  const img = safeSrc(post.thumbnail_url);
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
        <Title
          className={`font-bold text-gray-900 group-hover:text-brand-700 transition-colors duration-200 motion-reduce:transition-none [overflow-wrap:anywhere] text-balance ${
            featured ? "text-2xl md:text-3xl leading-tight" : large ? "text-2xl leading-snug" : "text-xl leading-snug"
          }`}
        >
          {/* after:inset-0 phủ link lên cả thẻ, chỉ cần một điểm dừng khi dùng phím Tab */}
          <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="outline-none after:absolute after:inset-0">
            {post.title}
          </Link>
        </Title>
        {post.excerpt && (
          <p className={`mt-3 text-base leading-relaxed text-gray-600 [overflow-wrap:anywhere] ${featured ? "line-clamp-4" : "line-clamp-3"}`}>
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <PostMeta author={post.author_name} publishedAt={post.published_at} readMinutes={post.read_minutes} />
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
