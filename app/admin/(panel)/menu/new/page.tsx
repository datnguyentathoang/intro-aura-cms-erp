import Link from "next/link";
import { adminJson } from "@/lib/api";
import type { AdminMenuItem, PageListItem } from "@/lib/admin-types";
import MenuForm from "@/components/admin/MenuForm";
import { createMenuItem } from "../actions";
import { parentOptions } from "@/lib/menu-options";

export default async function NewMenuItem({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [items, pages] = await Promise.all([
    adminJson<AdminMenuItem[]>("/api/admin/menu"),
    adminJson<PageListItem[]>("/api/admin/pages"),
  ]);
  return (
    <div className="space-y-6">
      <Link href="/admin/menu" className="text-sm font-medium text-brand-600 hover:underline">← Quay lại menu</Link>
      <h1 className="text-3xl font-bold text-gray-900">Thêm mục menu</h1>
      {error && <p className="max-w-2xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <MenuForm
        parents={parentOptions(items ?? [])}
        pages={(pages ?? []).map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
        action={createMenuItem}
        submitLabel="Thêm mục"
      />
    </div>
  );
}
