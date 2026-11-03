import Link from "next/link";
import { adminJson } from "@/lib/api";
import type { AdminCategory } from "@/lib/admin-types";
import CategoryForm from "@/components/admin/CategoryForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteCategory } from "./actions";

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const categories = (await adminJson<AdminCategory[]>("/api/admin/categories")) ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chuyên mục</h1>
        <p className="mt-1 text-gray-600">{categories.length} chuyên mục dùng để phân loại bài viết.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Thêm chuyên mục</h2>
        <CategoryForm />
      </section>

      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-52 flex-1">
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="mt-0.5 text-sm text-gray-600">
                  /{c.slug} ·{" "}
                  <Link href={`/admin/posts?category_id=${c.id}`} className="font-medium text-brand-700 hover:underline">{c.post_count} bài viết</Link>
                </p>
                {c.description && <p className="mt-1 text-sm text-gray-700">{c.description}</p>}
              </div>
              <DeleteButton action={deleteCategory.bind(null, c.id)} message={`Xóa chuyên mục "${c.name}"? Các bài viết vẫn còn, chỉ gỡ khỏi chuyên mục này.`} />
            </div>
            <details className="mt-3 border-t border-gray-100 pt-3">
              <summary className="cursor-pointer rounded py-1 text-sm font-medium text-brand-700">Sửa chuyên mục</summary>
              <div className="mt-3">
                <CategoryForm category={c} />
              </div>
            </details>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
            Chưa có chuyên mục nào.
          </li>
        )}
      </ul>
    </div>
  );
}
