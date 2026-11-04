import Link from "next/link";
import { adminJson } from "@/lib/api";
import type { AdminMenuItem } from "@/lib/admin-types";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteMenuItem, moveMenuItem } from "./actions";

const arrowBtn =
  "w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-brand-100 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

export default async function MenuAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const items = (await adminJson<AdminMenuItem[]>("/api/admin/menu")) ?? [];

  const flat: { item: AdminMenuItem; depth: number; first: boolean; last: boolean }[] = [];
  const walk = (parent: string | null, depth: number) => {
    if (depth > 5) return;
    const sibs = items.filter((m) => m.parent_id === parent).sort((a, b) => a.sort_order - b.sort_order);
    sibs.forEach((m, i) => {
      flat.push({ item: m, depth, first: i === 0, last: i === sibs.length - 1 });
      walk(m.id, depth + 1);
    });
  };
  walk(null, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu website</h1>
          <p className="text-gray-500 mt-1">{items.length} mục, tối đa 3 cấp. Chưa có mục nào thì website dùng menu mặc định.</p>
        </div>
        <Link href="/admin/menu/new" className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors">
          ＋ Thêm mục menu
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {flat.map(({ item: m, depth, first, last }) => (
          <li key={m.id} style={{ marginLeft: depth * 28 }} className="bg-white border border-gray-100 rounded-xl p-3 flex flex-wrap items-center gap-3 shadow-sm">
            <div className="flex gap-1">
              <form action={moveMenuItem.bind(null, m.id, "up")}><button className={arrowBtn} disabled={first} title="Lên">↑</button></form>
              <form action={moveMenuItem.bind(null, m.id, "down")}><button className={arrowBtn} disabled={last} title="Xuống">↓</button></form>
            </div>
            <div className="flex-1 min-w-44">
              <p className="font-medium text-gray-900">{depth > 0 && <span className="text-gray-400">↳ </span>}{m.label}</p>
              <p className="text-xs text-gray-500">
                {m.page_id ? `Trang: ${m.page_title ?? "(đã xóa)"} (/${m.page_slug ?? ""})` : m.url ? `URL: ${m.url}` : "Nhóm (không có liên kết)"}
                {!m.is_published && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">Đang ẩn</span>}
              </p>
            </div>
            <Link href={`/admin/menu/${m.id}`} className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors">Sửa</Link>
            <DeleteButton action={deleteMenuItem.bind(null, m.id)} message="Xóa mục này? Các mục con của nó cũng bị xóa." />
          </li>
        ))}
        {flat.length === 0 && (
          <div className="text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl py-12">
            Chưa có mục menu. Website đang dùng các liên kết mặc định (Tính năng, Giao diện...).
          </div>
        )}
      </ul>
    </div>
  );
}