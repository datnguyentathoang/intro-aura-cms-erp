/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { adminJson } from "@/lib/api";
import { safeSrc } from "@/lib/safe";
import type { AdminProjectListItem } from "@/lib/admin-types";
import DeleteButton from "@/components/admin/DeleteButton";
import PostStatusBadge from "@/components/admin/PostStatusBadge";
import { deleteProject, moveProject, setProjectStatus } from "./actions";

const ACTION = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
const ARROW = "w-8 h-8 cursor-pointer rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-brand-100 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-700 transition-colors";
const HERE = "/admin/projects";

export default async function ProjectsList({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const items = (await adminJson<AdminProjectListItem[]>("/api/admin/projects")) ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dự án</h1>
          <p className="mt-1 text-gray-600">{items.length} dự án. Thứ tự ở đây là thứ tự hiển thị trên trang Dự án.</p>
        </div>
        <Link href="/admin/projects/new" className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors">
          ＋ Thêm dự án
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <ul className="space-y-3">
        {items.map((p, i) => {
          const img = safeSrc(p.thumbnail_url);
          const isPublished = p.status === "published";
          const meta = [p.client_name, p.industry].filter(Boolean).join(" · ");
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <form action={moveProject.bind(null, p.id, "up")}>
                  <button disabled={i === 0} aria-label={`Chuyển ${p.title} lên`} title="Chuyển lên" className={ARROW}>↑</button>
                </form>
                <form action={moveProject.bind(null, p.id, "down")}>
                  <button disabled={i === items.length - 1} aria-label={`Chuyển ${p.title} xuống`} title="Chuyển xuống" className={ARROW}>↓</button>
                </form>
              </div>
              <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-xs text-gray-600">
                {img ? <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" /> : "Không ảnh"}
              </div>
              <div className="min-w-52 flex-1">
                <Link href={`/admin/projects/${p.id}`} className="font-semibold text-gray-900 hover:text-brand-700 [overflow-wrap:anywhere]">{p.title}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <PostStatusBadge status={p.status} />
                  {meta && <span className="[overflow-wrap:anywhere]">{meta}</span>}
                  <span>{p.image_count} ảnh</span>
                  <span>Cập nhật {new Date(p.updated_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/projects/${p.id}`} className={`${ACTION} text-brand-700 bg-brand-50 hover:bg-brand-100`}>Sửa</Link>
                <a href={isPublished ? `/portfolio/${p.slug}` : `/admin/preview/projects/${p.id}`} target="_blank" rel="noopener" className={`${ACTION} text-gray-700 bg-slate-100 hover:bg-slate-200`}>
                  {isPublished ? "Xem trang" : "Xem trước"}
                </a>
                <form action={setProjectStatus.bind(null, p.id, isPublished ? "unpublish" : "publish", HERE)}>
                  <button className={`${ACTION} ${isPublished ? "text-orange-800 bg-orange-50 hover:bg-orange-100" : "text-green-800 bg-green-50 hover:bg-green-100"}`}>
                    {isPublished ? "Về nháp" : "Xuất bản"}
                  </button>
                </form>
                <DeleteButton action={deleteProject.bind(null, p.id)} message="Xóa dự án này cùng thư viện ảnh? Không thể hoàn tác." />
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
            Chưa có dự án nào. Bấm &quot;Thêm dự án&quot; để bắt đầu.
          </li>
        )}
      </ul>
    </div>
  );
}
