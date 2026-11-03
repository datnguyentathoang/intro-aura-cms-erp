"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { savePost, uploadPostImage, type PostFormState } from "@/app/admin/(panel)/posts/actions";
import type { AdminCategory, AdminPost } from "@/lib/admin-types";
import { slugify } from "@/lib/slugify";
import { CARD, Counter, INPUT, LABEL, SaveButtons, ThumbnailField } from "@/components/admin/EditorFormParts";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function PostForm({ post, categories }: { post?: AdminPost; categories: AdminCategory[] }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail_url ?? "");
  const [author, setAuthor] = useState(post?.author_name ?? "Aura");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [selected, setSelected] = useState<string[]>(post?.category_ids ?? []);

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
  const [state, action, pending] = useActionState<PostFormState, FormData>(async (prev, form) => {
    dirty.current = false;
    const result = await savePost(post?.id ?? null, prev, form);
    // Chỉ chạy tới đây khi có lỗi (lưu thành công sẽ chuyển trang)
    dirty.current = true;
    return result;
  }, {});

  return (
    <form
      // Tự gửi trong startTransition: với <form action>, React reset form sau mỗi lần gửi và bỏ dấu các ô đánh dấu
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
            Tiêu đề<span className="ml-0.5 text-red-700">*</span>
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
              <span className="whitespace-nowrap pl-3 font-normal text-gray-600">/blog/</span>
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
              {post?.status === "published" && " Đổi slug sẽ làm đường dẫn cũ không còn truy cập được."}
            </span>
          </label>
        </div>

        <div>
          <p className={`${LABEL} mb-1.5`}>Nội dung</p>
          <RichTextEditor name="content" value={post?.content ?? ""} upload={uploadPostImage} onChange={() => { dirty.current = true; }} />
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
          <p className="text-xs text-gray-600">Để trống thì dùng tiêu đề và tóm tắt của bài.</p>
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6">
        <div className={`${CARD} space-y-3`}>
          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>
          )}
          <SaveButtons status={post?.status ?? "draft"} pending={pending} publishing={publishing} />
        </div>

        <div className={CARD}>
          <ThumbnailField
            value={thumbnail}
            upload={uploadPostImage}
            onChange={(url) => {
              dirty.current = true;
              setThumbnail(url);
            }}
          />
        </div>

        <fieldset className={CARD}>
          <legend className="sr-only">Chuyên mục</legend>
          <p className={LABEL} aria-hidden="true">Chuyên mục</p>
          {categories.length > 0 ? (
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
              {categories.map((c) => (
                <label key={c.id} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-1 text-sm text-gray-800 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="category_ids"
                    value={c.id}
                    checked={selected.includes(c.id)}
                    onChange={(e) => setSelected((cur) => (e.target.checked ? [...cur, c.id] : cur.filter((x) => x !== c.id)))}
                    className="h-4 w-4 accent-brand-700"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Chưa có chuyên mục. <Link href="/admin/categories" target="_blank" className="font-medium text-brand-700 underline">Tạo chuyên mục</Link>
            </p>
          )}
        </fieldset>

        <div className={`${CARD} space-y-5`}>
          <label className={LABEL}>
            Tóm tắt
            <textarea name="excerpt" rows={4} maxLength={500} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={INPUT} />
            <span className="mt-1 block text-xs font-normal text-gray-600">Hiện trên thẻ bài viết.</span>
          </label>
          <label className={LABEL}>
            Tác giả
            <input name="author_name" maxLength={100} value={author} onChange={(e) => setAuthor(e.target.value)} className={INPUT} />
          </label>
        </div>
      </aside>
    </form>
  );
}
