"use client";
import { useActionState, useState } from "react";
import { saveCategory, type CategoryFormState } from "@/app/admin/(panel)/categories/actions";
import type { AdminCategory } from "@/lib/admin-types";
import { slugify } from "@/lib/slugify";
import SubmitButton from "@/components/admin/SubmitButton";

const LABEL = "block text-sm font-medium text-gray-700";
const INPUT =
  "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";

export default function CategoryForm({ category }: { category?: AdminCategory }) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [description, setDescription] = useState(category?.description ?? "");

  const [state, action] = useActionState<CategoryFormState, FormData>(async (_prev, form) => {
    const result = await saveCategory(category?.id ?? null, form);
    // Thêm mới thành công thì làm trống form để nhập chuyên mục tiếp theo
    if (result.ok && !category) {
      setName("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
    }
    return result;
  }, {});

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className={LABEL}>
        Tên chuyên mục<span className="ml-0.5 text-red-700">*</span>
        <input
          name="name"
          required
          maxLength={100}
          value={name}
          className={INPUT}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </label>
      <label className={LABEL}>
        Đường dẫn (slug)<span className="ml-0.5 text-red-700">*</span>
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={80}
          value={slug}
          className={INPUT}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </label>
      <label className={`${LABEL} sm:col-span-2`}>
        Mô tả
        <textarea name="description" rows={2} maxLength={400} value={description} className={INPUT} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <SubmitButton label={category ? "Lưu chuyên mục" : "Thêm chuyên mục"} />
        {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
        {state.ok && <p className="text-sm text-green-800" role="status">Đã lưu.</p>}
      </div>
    </form>
  );
}
