"use client";
import { useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";

const input =
  "mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";
const toggle =
  "relative w-11 h-6 shrink-0 rounded-full bg-gray-300 peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5";

export default function MenuForm({
  initial, parents, pages, action, submitLabel,
}: {
  initial?: { label: string; parent_id: string | null; page_id: string | null; url: string | null; is_published: boolean };
  parents: { id: string; label: string }[];
  pages: { id: string; title: string; slug: string }[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const [target, setTarget] = useState<"none" | "page" | "url">(initial?.page_id ? "page" : initial?.url ? "url" : "none");

  return (
    <form action={action} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5 max-w-2xl">
      <label className="block text-sm font-medium text-gray-700">
        Tên hiển thị<span className="text-red-500 ml-0.5">*</span>
        <input name="label" required maxLength={100} defaultValue={initial?.label ?? ""} className={input} />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Mục cha
        <select name="parent_id" defaultValue={initial?.parent_id ?? ""} className={input}>
          <option value="">-- Cấp cao nhất --</option>
          {parents.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <span className="block text-xs text-gray-500 font-normal mt-1">Menu tối đa 3 cấp.</span>
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Liên kết tới</legend>
        <div className="flex flex-wrap gap-5 text-sm text-gray-700">
          {([["none", "Không (chỉ làm nhóm)"], ["page", "Một trang"], ["url", "Địa chỉ URL"]] as const).map(([v, t]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="target" value={v} checked={target === v} onChange={() => setTarget(v)} />
              {t}
            </label>
          ))}
        </div>
        {target === "page" && (
          <select name="page_id" defaultValue={initial?.page_id ?? ""} className={input} required>
            <option value="">-- Chọn trang --</option>
            {pages.map((p) => <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>)}
          </select>
        )}
        {target === "url" && (
          <input name="url" defaultValue={initial?.url ?? ""} required maxLength={500} placeholder="/lien-he hoặc https://…" className={input} />
        )}
        <p className="text-xs text-gray-500">Mục trỏ tới trang chưa xuất bản sẽ tự ẩn khỏi website.</p>
      </fieldset>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input name="is_published" type="checkbox" defaultChecked={initial?.is_published ?? true} className="peer sr-only" />
        <span className={toggle} />
        <span className="text-sm font-medium text-gray-700">Hiển thị trên website</span>
      </label>

      <SubmitButton label={submitLabel} />
    </form>
  );
}