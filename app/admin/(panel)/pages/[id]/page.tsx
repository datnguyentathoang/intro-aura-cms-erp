import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminPage } from "@/lib/admin-types";
import { SCHEMAS, SECTION_ORDER, summarize } from "@/lib/section-schemas";
import PageMetaForm from "@/components/admin/PageMetaForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { addSection, deleteSection, moveSection, setPublished, updatePage } from "../actions";

const arrowBtn =
  "w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-brand-100 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

export default async function EditPageScreen({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const page = await adminJson<AdminPage>(`/api/admin/pages/${id}`);
  if (!page) notFound();

  const published = page.status === "published";
  const sections = page.sections ?? [];

  return (
    <div className="space-y-8 max-w-4xl">
      <Link href="/admin/pages" className="text-sm font-medium text-brand-600 hover:underline">← Quay lại danh sách trang</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            /{page.slug}{" "}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
              {published ? "Đã xuất bản" : "Bản nháp"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/preview/${page.id}`} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-slate-100 hover:bg-slate-200 transition-colors">Xem trước</a>
          {published && (
            <a href={`/${page.slug}`} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-slate-100 hover:bg-slate-200 transition-colors">Xem trang thật</a>
          )}
          <form action={setPublished.bind(null, page.id, !published)}>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${published ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}>
              {published ? "Ẩn (về nháp)" : "Xuất bản"}
            </button>
          </form>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Đã lưu thay đổi.</p>}

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Thông tin trang và SEO</h2>
        <PageMetaForm
          mode="edit"
          initial={{
            title: page.title, slug: page.slug, seo_title: page.seo_title,
            seo_description: page.seo_description, og_image_url: page.og_image_url,
          }}
          action={updatePage.bind(null, page.id)}
          submitLabel="Lưu thông tin"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Các section ({sections.length})</h2>
        <ol className="space-y-3">
          {sections.map((s, i) => (
            <li key={s.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
              <div className="flex flex-col gap-1">
                <form action={moveSection.bind(null, page.id, s.id, "up")}>
                  <button className={arrowBtn} disabled={i === 0} title="Chuyển lên">↑</button>
                </form>
                <form action={moveSection.bind(null, page.id, s.id, "down")}>
                  <button className={arrowBtn} disabled={i === sections.length - 1} title="Chuyển xuống">↓</button>
                </form>
              </div>
              <div className="flex-1 min-w-52">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {SCHEMAS[s.type]?.label ?? s.type}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.is_published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {s.is_published ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700 truncate">{summarize(s.content ?? {})}</p>
              </div>
              <Link href={`/admin/pages/${page.id}/sections/${s.id}`} className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors">Sửa</Link>
              <DeleteButton action={deleteSection.bind(null, page.id, s.id)} message="Xóa section này?" />
            </li>
          ))}
          {sections.length === 0 && (
            <div className="text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl py-10">
              Trang chưa có section nào. Chọn loại section bên dưới để thêm.
            </div>
          )}
        </ol>

        <form action={addSection.bind(null, page.id)} className="flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-4">
          <label className="block text-sm font-medium text-gray-700">
            Thêm section mới
            <select name="type" defaultValue="" required className="mt-1.5 block w-72 rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-normal">
              <option value="" disabled>-- Chọn loại --</option>
              {SECTION_ORDER.map((t) => <option key={t} value={t} title={SCHEMAS[t].description}>{SCHEMAS[t].label}</option>)}
            </select>
          </label>
          <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors">＋ Thêm</button>
        </form>
      </section>
    </div>
  );
}