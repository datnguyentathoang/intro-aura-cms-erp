"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { saveProject, uploadProjectImage, type ProjectFormState } from "@/app/admin/(panel)/projects/actions";
import type { AdminProject } from "@/lib/admin-types";
import { slugify } from "@/lib/slugify";
import { CARD, Counter, INPUT, LABEL, SaveButtons, ThumbnailField } from "@/components/admin/EditorFormParts";
import GalleryField from "@/components/admin/GalleryField";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function ProjectForm({ project }: { project?: AdminProject }) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [thumbnail, setThumbnail] = useState(project?.thumbnail_url ?? "");
  const [seoTitle, setSeoTitle] = useState(project?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(project?.seo_description ?? "");
  const [uploading, setUploading] = useState(false);

  // Cảnh báo khi đóng tab lúc còn thay đổi chưa lưu
  const dirty = useRef(false);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const [publishing, setPublishing] = useState(false);
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(async (prev, form) => {
    dirty.current = false;
    const result = await saveProject(project?.id ?? null, prev, form);
    // Chỉ chạy tới đây khi có lỗi (lưu thành công sẽ chuyển trang)
    dirty.current = true;
    return result;
  }, {});

  return (
    <form
      // Tự gửi trong startTransition: với <form action>, React xoá trắng form sau mỗi lần gửi, kể cả khi lưu lỗi
      onSubmit={(e) => {
        e.preventDefault();
        const submitter = e.nativeEvent instanceof SubmitEvent ? e.nativeEvent.submitter : null;
        const form = new FormData(e.currentTarget, submitter);
        setPublishing(form.get("intent") === "publish");
        startTransition(() => action(form));
      }}
      onChange={() => { dirty.current = true; }}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="min-w-0 space-y-5">
        <div className={`${CARD} space-y-5`}>
          <label className={LABEL}>
            Tên dự án<span className="ml-0.5 text-red-700">*</span>
            <input
              name="title"
              required
              maxLength={200}
              value={title}
              className={INPUT}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value, 120));
              }}
            />
          </label>
          <label className={LABEL}>
            Đường dẫn (slug)<span className="ml-0.5 text-red-700">*</span>
            <div className="mt-1.5 flex items-center rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-brand-500">
              <span className="whitespace-nowrap pl-3 font-normal text-gray-600">/portfolio/</span>
              <input
                name="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={120}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="w-full min-w-0 rounded-lg bg-transparent px-1 py-2.5 text-base font-normal text-gray-900 outline-none"
              />
            </div>
            <span className="mt-1 block text-xs font-normal text-gray-600">
              Chữ thường không dấu, số và dấu gạch ngang.
              {project?.status === "published" && " Đổi slug sẽ làm đường dẫn cũ không còn truy cập được."}
            </span>
          </label>
        </div>

        <div>
          <p className={`${LABEL} mb-1.5`}>Nội dung case study</p>
          <RichTextEditor name="content" value={project?.content ?? ""} upload={uploadProjectImage} onChange={() => { dirty.current = true; }} />
          <p className="mt-1.5 text-xs text-gray-600">Gợi ý các mục: Bài toán, Giải pháp, Kết quả.</p>
        </div>

        <div className={CARD}>
          <GalleryField
            initial={project?.images ?? []}
            upload={uploadProjectImage}
            onChange={() => { dirty.current = true; }}
            onUploading={setUploading}
          />
        </div>

        <div className={`${CARD} space-y-5`}>
          <h2 className="text-lg font-semibold text-gray-900">Hiển thị trên Google</h2>
          <label className={LABEL}>
            SEO title
            <input name="seo_title" maxLength={200} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={INPUT} />
            <Counter value={seoTitle} max={60} />
          </label>
          <label className={LABEL}>
            SEO description
            <textarea name="seo_description" rows={3} maxLength={400} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={INPUT} />
            <Counter value={seoDescription} max={160} />
          </label>
          <p className="text-xs text-gray-600">Để trống thì dùng tên và tóm tắt của dự án.</p>
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6">
        <div className={`${CARD} space-y-3`}>
          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 [overflow-wrap:anywhere]" role="alert">{state.error}</p>
          )}
          <SaveButtons status={project?.status ?? "draft"} pending={pending} publishing={publishing} disabled={uploading} />
          {uploading && <p className="text-xs text-gray-600">Đợi tải xong ảnh rồi lưu.</p>}
        </div>

        <div className={CARD}>
          <ThumbnailField
            value={thumbnail}
            upload={uploadProjectImage}
            onChange={(url) => {
              dirty.current = true;
              setThumbnail(url);
            }}
          />
        </div>

        <div className={`${CARD} space-y-5`}>
          <label className={LABEL}>
            Khách hàng
            <input name="client_name" maxLength={200} defaultValue={project?.client_name ?? ""} className={INPUT} />
          </label>
          <label className={LABEL}>
            Lĩnh vực
            <input name="industry" maxLength={100} defaultValue={project?.industry ?? ""} className={INPUT} />
            <span className="mt-1 block text-xs font-normal text-gray-600">Dự án cùng lĩnh vực được gợi ý trước. Nên gõ thống nhất, ví dụ “Bán lẻ”.</span>
          </label>
          <label className={LABEL}>
            Tóm tắt
            <textarea name="summary" rows={4} maxLength={500} defaultValue={project?.summary ?? ""} className={INPUT} />
            <span className="mt-1 block text-xs font-normal text-gray-600">Hiện trên thẻ dự án và đầu trang case study.</span>
          </label>
        </div>
      </aside>
    </form>
  );
}
