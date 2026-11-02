import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = { title: "Không tìm thấy trang" };

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="max-w-2xl mx-auto px-4 py-20 md:py-28 text-center">
        <p className="text-sm font-semibold text-brand-700">Lỗi 404</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-gray-900 text-balance">
          Không tìm thấy trang này
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Đường dẫn có thể đã thay đổi hoặc trang không còn tồn tại.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className={`inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-6 font-medium text-white hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
          >
            Về trang chủ
          </Link>
          <Link
            href="/blog"
            className={`inline-flex min-h-11 items-center rounded-xl border border-gray-300 px-6 font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
          >
            Xem blog
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
