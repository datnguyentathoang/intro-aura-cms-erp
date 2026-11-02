import Link from "next/link";
import { pageWindow } from "@/lib/blog";

type Props = { page: number; totalPages: number; href: (page: number) => string };

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const CELL = "inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium tabular-nums";
const STEP = `${CELL} min-w-11 gap-2 border sm:px-4`;
const HOVER = "hover:bg-gray-100 transition-colors duration-200 motion-reduce:transition-none";

function Step({ to, rel, label, d }: { to: string | null; rel: "prev" | "next"; label: string; d: string }) {
  const body = (
    <>
      {rel === "prev" && <Arrow d={d} />}
      <span className="hidden sm:inline">{label}</span>
      {rel === "next" && <Arrow d={d} />}
    </>
  );
  if (!to) {
    // Giữ chỗ để các số trang không bị xê dịch ở trang đầu và trang cuối
    return (
      <span className={`${STEP} border-gray-200 text-gray-400 cursor-not-allowed`} aria-hidden="true">
        {body}
      </span>
    );
  }
  return (
    <Link href={to} rel={rel} aria-label={label} className={`${STEP} border-gray-300 text-gray-800 ${HOVER} ${FOCUS_RING}`}>
      {body}
    </Link>
  );
}

function Arrow({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function Numbers({ page, totalPages, href, radius, className }: Props & { radius: number; className: string }) {
  return (
    <ul className={`items-center gap-1 ${className}`}>
      {pageWindow(page, totalPages, radius).map((p, i) => (
        <li key={p ?? `gap-${i}`}>
          {p === null ? (
            <span className={`${CELL} w-8 text-gray-600`} aria-hidden="true">…</span>
          ) : (
            <Link
              href={href(p)}
              aria-label={`Trang ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`${CELL} min-w-11 px-2 ${FOCUS_RING} ${p === page ? "bg-brand-700 text-white" : `text-gray-800 ${HOVER}`}`}
            >
              {p}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Pagination({ page, totalPages, href }: Props) {
  return (
    <nav aria-label="Phân trang" className="mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      <Step to={page > 1 ? href(page - 1) : null} rel="prev" label="Trang trước" d="M19 12H5m6 6-6-6 6-6" />
      {/* Màn hình hẹp hiện ít số hơn để không phải xuống hàng */}
      <Numbers page={page} totalPages={totalPages} href={href} radius={0} className="flex sm:hidden" />
      <Numbers page={page} totalPages={totalPages} href={href} radius={1} className="hidden sm:flex" />
      <Step to={page < totalPages ? href(page + 1) : null} rel="next" label="Trang sau" d="M5 12h14m-6-6 6 6-6 6" />
    </nav>
  );
}
