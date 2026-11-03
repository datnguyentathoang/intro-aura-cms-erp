/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { s, safeSrc } from "@/lib/safe";
import type { ProjectImage } from "@/lib/types";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const CRUMB_LINK = `inline-block rounded py-1 whitespace-nowrap hover:text-brand-700 hover:underline ${FOCUS_RING}`;

// Ít ảnh thì giảm số cột để không còn ô trống
function galleryColumns(count: number) {
  if (count === 1) return "";
  if (count === 2 || count === 4) return "sm:grid-cols-2";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

// Phần thân trang dự án, dùng chung cho trang công khai và trang xem trước của admin
export default function ProjectArticle({
  project,
}: {
  project: {
    title: string;
    client_name: string | null;
    industry: string | null;
    summary: string | null;
    content: string;
    thumbnail_url: string | null;
    images: ProjectImage[];
  };
}) {
  const cover = safeSrc(project.thumbnail_url);
  const images = project.images.flatMap((i) => {
    const src = safeSrc(i.image_url);
    return src ? [{ src, caption: s(i.caption, 300) }] : [];
  });
  const facts = [
    { label: "Khách hàng", value: project.client_name },
    { label: "Lĩnh vực", value: project.industry },
  ].filter((f) => f.value);

  return (
    <article className="max-w-5xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
      <nav aria-label="Đường dẫn">
        <ol className="flex items-center gap-2 text-sm text-gray-600">
          <li><Link href="/" className={CRUMB_LINK}>Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/portfolio" className={CRUMB_LINK}>Dự án</Link></li>
          <li aria-hidden="true">/</li>
          <li className="min-w-0 truncate" aria-current="page">{project.title}</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-gray-900 text-balance [overflow-wrap:anywhere]">
          {project.title}
        </h1>
        {project.summary && (
          <p className="mt-4 text-lg leading-relaxed text-gray-600 [overflow-wrap:anywhere]">{project.summary}</p>
        )}
      </header>

      {cover && (
        <img
          src={cover}
          alt=""
          fetchPriority="high"
          className="mt-8 w-full aspect-video rounded-2xl object-cover bg-gray-100"
        />
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,38rem)_minmax(0,16rem)] lg:justify-between">
        {/* API đã lọc HTML bằng HtmlSanitizer khi lưu */}
        <div
          className="rich-text min-w-0 [overflow-wrap:anywhere] [&>:first-child]:mt-0"
          dangerouslySetInnerHTML={{ __html: s(project.content, 200000) }}
        />
        {facts.length > 0 && (
          <aside aria-label="Thông tin dự án" className="order-first self-start rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:order-last">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {facts.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-sm text-gray-600">{f.label}</dt>
                  <dd className="mt-1 font-semibold text-gray-900 [overflow-wrap:anywhere]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>

      {images.length > 0 && (
        <section aria-labelledby="gallery-title" className="mt-12 md:mt-16">
          <h2 id="gallery-title" className="text-2xl font-bold tracking-tight text-gray-900">Hình ảnh dự án</h2>
          <ul className={`mt-6 grid gap-6 ${galleryColumns(images.length)}`}>
            {images.map((image, i) => (
              <li key={`${image.src}-${i}`}>
                <a
                  href={image.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block rounded-2xl ${FOCUS_RING}`}
                >
                  <figure>
                    <img
                      src={image.src}
                      alt={image.caption ? "" : `Ảnh ${i + 1} của dự án`}
                      loading="lazy"
                      className="w-full aspect-video rounded-2xl border border-gray-200 object-cover bg-gray-100 group-hover:border-brand-200 transition-colors duration-200 motion-reduce:transition-none"
                    />
                    {image.caption && (
                      <figcaption className="mt-2 text-sm leading-relaxed text-gray-600 [overflow-wrap:anywhere]">{image.caption}</figcaption>
                    )}
                  </figure>
                  <span className="sr-only">(mở ảnh trong tab mới)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/portfolio"
        className={`mt-10 inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6 6-6-6 6-6" />
        </svg>
        Xem tất cả dự án
      </Link>
    </article>
  );
}
