import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminMenuItem, PageListItem } from "@/lib/admin-types";
import MenuForm from "@/components/admin/MenuForm";
import { updateMenuItem } from "../actions";
import { parentOptions } from "../new/page";

export default async function EditMenuItem({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [items, pages] = await Promise.all([
    adminJson<AdminMenuItem[]>("/api/admin/menu"),
    adminJson<PageListItem[]>("/api/admin/pages"),
  ]);
  const all = items ?? [];
  const item = all.find((m) => m.id === id);
  if (!item) notFound();

  // Loại bỏ chính nó và các mục con khỏi danh sách "mục cha"
  const exclude = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const m of all) {
      if (m.parent_id && exclude.has(m.parent_id) && !exclude.has(m.id)) {
        exclude.add(m.id);
        grew = true;
      }
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/menu" className="text-sm font-medium text-brand-600 hover:underline">← Quay lại menu</Link>
      <h1 className="text-3xl font-bold text-gray-900">Sửa mục menu</h1>
      {error && <p className="max-w-2xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <MenuForm
        initial={{ label: item.label, parent_id: item.parent_id, page_id: item.page_id, url: item.url, is_published: item.is_published }}
        parents={parentOptions(all, exclude)}
        pages={(pages ?? []).map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
        action={updateMenuItem.bind(null, id)}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}