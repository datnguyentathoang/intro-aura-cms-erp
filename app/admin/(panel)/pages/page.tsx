import Link from "next/link";
import { adminJson } from "@/lib/api";
import type { PageListItem } from "@/lib/admin-types";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePage, setPublished } from "./actions";

export default async function PagesList({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const pages = (await adminJson<PageListItem[]>("/api/admin/pages")) ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trang (Pages)</h1>
          <p className="text-gray-500 mt-1">{pages.length} trang. Mỗi trang gồm nhiều section do bạn sắp xếp.</p>
        </div>
        <Link href="/admin/pages/new" className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors">
          ＋ Tạo trang mới
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {pages.map((p) => {
          const published = p.status === "published";
          return (
            <li key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
              <div className="flex-1 min-w-52">
                <p className="font-semibold text-gray-900">{p.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500">/{p.slug}</span>
                  <span className={`rounded-full px-2 py-0.5 ${published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {published ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{p.section_count} section</span>
                  <span className="text-gray-400">Cập nhật {new Date(p.updated_at).toLocaleString("vi-VN")}</span>
                </div>
              </div>
              <Link href={`/admin/pages/${p.id}`} className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors">Sửa</Link>
              <a
                href={published ? `/${p.slug}` : `/admin/preview/${p.id}`}
                target="_blank" rel="noopener"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {published ? "Xem trang" : "Xem trước"}
              </a>
              <form action={setPublished.bind(null, p.id, !published)}>
                <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${published ? "text-orange-700 bg-orange-50 hover:bg-orange-100" : "text-green-700 bg-green-50 hover:bg-green-100"}`}>
                  {published ? "Ẩn (về nháp)" : "Xuất bản"}
                </button>
              </form>
              <DeleteButton action={deletePage.bind(null, p.id)} message="Xóa trang này cùng toàn bộ section? Không thể hoàn tác." />
            </li>
          );
        })}
        {pages.length === 0 && (
          <div className="text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl py-12">
            Chưa có trang nào. Bấm &quot;Tạo trang mới&quot; để bắt đầu.
          </div>
        )}
      </ul>
    </div>
  );
}