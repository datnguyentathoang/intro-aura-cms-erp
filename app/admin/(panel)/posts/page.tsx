/* eslint-disable @next/next/no-img-element */
import Form from "next/form";
import Link from "next/link";
import { adminJson } from "@/lib/api";
import { parsePage } from "@/lib/blog";
import { safeSrc } from "@/lib/safe";
import type { AdminCategory, AdminPostList } from "@/lib/admin-types";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/Pagination";
import PostStatusBadge from "@/components/admin/PostStatusBadge";
import { deletePost, setPostStatus } from "./actions";

const PAGE_SIZE = 20;
const FIELD = "min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500";
const ACTION = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Filters = { q: string; status: string; categoryId: string };

function listHref({ q, status, categoryId }: Filters, page = 1) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (categoryId) params.set("category_id", categoryId);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/posts?${search}` : "/admin/posts";
}

export default async function PostsList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const text = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
  const status = text(sp.status);
  const filters: Filters = {
    q: text(sp.q).slice(0, 100),
    status: status === "draft" || status === "published" || status === "archived" ? status : "",
    categoryId: UUID.test(text(sp.category_id)) ? text(sp.category_id) : "",
  };
  const page = parsePage(sp.page);
  const error = text(sp.error);

  const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId) params.set("category_id", filters.categoryId);

  const [list, categories] = await Promise.all([
    adminJson<AdminPostList>(`/api/admin/posts?${params}`),
    adminJson<AdminCategory[]>("/api/admin/categories"),
  ]);
  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.ceil(total / (list?.page_size || PAGE_SIZE));
  const filtered = Boolean(filters.q || filters.status || filters.categoryId);
  const here = listHref(filters, page);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bài viết</h1>
          <p className="mt-1 text-gray-600">{total} bài viết{filtered ? " khớp bộ lọc" : ""}.</p>
        </div>
        <Link href="/admin/posts/new" className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors">
          ＋ Viết bài mới
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <Form action="/admin/posts" role="search" className="flex flex-wrap items-center gap-2">
        <label htmlFor="post-q" className="sr-only">Tìm theo tiêu đề</label>
        <input key={filters.q} id="post-q" type="search" name="q" defaultValue={filters.q} maxLength={100} placeholder="Tìm theo tiêu đề..." className={`${FIELD} min-w-52 flex-1`} />
        <label htmlFor="post-status" className="sr-only">Trạng thái</label>
        <select key={`s${filters.status}`} id="post-status" name="status" defaultValue={filters.status} className={FIELD}>
          <option value="">Mọi trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="published">Đã xuất bản</option>
          <option value="archived">Đã lưu trữ</option>
        </select>
        <label htmlFor="post-category" className="sr-only">Chuyên mục</label>
        <select key={`c${filters.categoryId}`} id="post-category" name="category_id" defaultValue={filters.categoryId} className={FIELD}>
          <option value="">Mọi chuyên mục</option>
          {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="min-h-11 cursor-pointer rounded-lg bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-900 transition-colors">Lọc</button>
        {filtered && <Link href="/admin/posts" className="rounded px-2 py-3 text-sm font-medium text-brand-700 underline">Xoá lọc</Link>}
      </Form>

      <ul className="space-y-3">
        {items.map((p) => {
          const img = safeSrc(p.thumbnail_url);
          const isPublished = p.status === "published";
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-brand-400">
                {img ? (
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                )}
              </div>
              <div className="min-w-52 flex-1">
                <Link href={`/admin/posts/${p.id}`} className="font-semibold text-gray-900 hover:text-brand-700 [overflow-wrap:anywhere]">{p.title}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <PostStatusBadge status={p.status} />
                  {p.categories?.length > 0 && <span>{p.categories.map((c) => c.name).join(", ")}</span>}
                  <span>Cập nhật {new Date(p.updated_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/posts/${p.id}`} className={`${ACTION} text-brand-700 bg-brand-50 hover:bg-brand-100`}>Sửa</Link>
                <a href={isPublished ? `/blog/${p.slug}` : `/admin/preview/posts/${p.id}`} target="_blank" rel="noopener" className={`${ACTION} text-gray-700 bg-slate-100 hover:bg-slate-200`}>
                  {isPublished ? "Xem bài" : "Xem trước"}
                </a>
                <form action={setPostStatus.bind(null, p.id, isPublished ? "unpublish" : "publish", here)}>
                  <button className={`${ACTION} ${isPublished ? "text-orange-800 bg-orange-50 hover:bg-orange-100" : "text-green-800 bg-green-50 hover:bg-green-100"}`}>
                    {isPublished ? "Về nháp" : "Xuất bản"}
                  </button>
                </form>
                {p.status !== "archived" && (
                  <form action={setPostStatus.bind(null, p.id, "archive", here)}>
                    <button className={`${ACTION} text-gray-700 bg-slate-100 hover:bg-slate-200`}>Lưu trữ</button>
                  </form>
                )}
                <DeleteButton action={deletePost.bind(null, p.id, here)} message="Xóa bài viết này? Không thể hoàn tác." />
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
            {filtered ? "Không có bài viết khớp bộ lọc." : page > 1 ? "Trang này không có bài viết." : "Chưa có bài viết nào. Bấm \"Viết bài mới\" để bắt đầu."}
          </li>
        )}
      </ul>

      {items.length > 0 && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} href={(p) => listHref(filters, p)} />
      )}
    </div>
  );
}
