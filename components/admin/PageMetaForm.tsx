"use client";
import { useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import ImagePick from "@/components/admin/ImagePick";
import { slugify } from "@/lib/slugify";

const input =
  "mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

export default function PageMetaForm({
  mode, initial, action, submitLabel,
}: {
  mode: "create" | "edit";
  initial?: { title: string; slug: string; seo_title: string | null; seo_description: string | null; og_image_url: string | null };
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [touched, setTouched] = useState(mode === "edit");

  return (
    <form action={action} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5 max-w-2xl">
      <label className="block text-sm font-medium text-gray-700">
        Tiêu đề trang<span className="text-red-500 ml-0.5">*</span>
        <input
          name="title" required value={title} className={input}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!touched) setSlug(slugify(e.target.value));
          }}
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Đường dẫn (slug)<span className="text-red-500 ml-0.5">*</span>
        <div className="mt-1.5 flex items-center rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-brand-500">
          <span className="pl-3 text-gray-400">/</span>
          <input
            name="slug" required value={slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80}
            onChange={(e) => { setTouched(true); setSlug(e.target.value); }}
            className="w-full rounded-lg px-1 py-2.5 font-normal bg-transparent outline-none"
          />
        </div>
        <span className="block text-xs text-gray-500 font-normal mt-1">
          Chữ thường không dấu, số và dấu gạch ngang.
          {mode === "edit" && " Đổi slug sẽ làm đường dẫn cũ không còn truy cập được."}
        </span>
      </label>

      <label className="block text-sm font-medium text-gray-700">
        SEO title
        <input name="seo_title" defaultValue={initial?.seo_title ?? ""} maxLength={200} className={input} />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        SEO description
        <textarea name="seo_description" rows={3} defaultValue={initial?.seo_description ?? ""} maxLength={400} className={input} />
      </label>
      <div className="text-sm font-medium text-gray-700">
        Ảnh chia sẻ mạng xã hội
        <ImagePick name="og_image_url" value={initial?.og_image_url ?? ""} />
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}