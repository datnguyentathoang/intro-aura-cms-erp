/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { safeSrc } from "@/lib/safe";
import type { ProjectListItem } from "@/lib/types";

// featured = true: thẻ lớn nằm ngang (từ md trở lên), dùng khi số dự án lẻ để lưới không bị lẻ cột
// titleAs: cấp tiêu đề của thẻ, để không nhảy cấp khi thẻ nằm dưới một h2 khác
export default function ProjectCard({
  project,
  featured = false,
  titleAs: Title = "h2",
}: {
  project: ProjectListItem;
  featured?: boolean;
  titleAs?: "h2" | "h3";
}) {
  const img = safeSrc(project.thumbnail_url);
  const meta = [project.client_name, project.industry].filter(Boolean).join(" · ");
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-4.25m16.5 0A2.18 2.18 0 0021 12.57V8.77a2.25 2.25 0 00-1.91-2.22 48 48 0 00-3.34-.37m4.5 8c-2.45.95-5.11 1.47-7.75 1.47s-5.3-.52-7.75-1.47m0 0A2.18 2.18 0 013 12.57V8.77c0-1.1.8-2.05 1.91-2.22a48 48 0 013.34-.37m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.93m7.5 0a48.6 48.6 0 00-7.5 0" />
            </svg>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col min-w-0 ${featured ? "p-6 md:p-10" : "p-6"}`}>
        {meta && <p className="mb-3 text-sm font-semibold text-brand-700 [overflow-wrap:anywhere]">{meta}</p>}
        <Title
          className={`font-bold text-gray-900 group-hover:text-brand-700 transition-colors duration-200 motion-reduce:transition-none [overflow-wrap:anywhere] text-balance ${
            featured ? "text-2xl md:text-3xl leading-tight" : "text-xl leading-snug"
          }`}
        >
          {/* after:inset-0 phủ link lên cả thẻ, chỉ cần một điểm dừng khi dùng phím Tab */}
          <Link href={`/portfolio/${encodeURIComponent(project.slug)}`} className="outline-none after:absolute after:inset-0">
            {project.title}
          </Link>
        </Title>
        {project.summary && (
          <p className={`mt-3 text-base leading-relaxed text-gray-600 [overflow-wrap:anywhere] ${featured ? "line-clamp-4" : "line-clamp-3"}`}>
            {project.summary}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-brand-700">
          Xem dự án
          <svg
            className="w-5 h-5 shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1"
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
