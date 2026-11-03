"use client";
/* eslint-disable @next/next/no-img-element */
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { savePost, uploadPostImage, type PostFormState } from "@/app/admin/(panel)/posts/actions";
import type { AdminCategory, AdminPost, AdminPostStatus } from "@/lib/admin-types";
import { slugify } from "@/lib/slugify";
import RichTextEditor from "@/components/admin/RichTextEditor";

const LABEL = "block text-sm font-medium text-gray-700";
const INPUT =
  "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
const CARD = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";
const BUTTON = "inline-flex w-full min-h-11 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`mt-1 block text-xs font-normal tabular-nums ${value.length > max ? "text-red-700" : "text-gray-600"}`}>
      {value.length}/{max} ký tự nên dùng
    </span>
  );
}

function SaveButtons({ status, pending, publishing }: { status: AdminPostStatus; pending: boolean; publishing: boolean }) {
  const saving = pending && !publishing;
  const secondary = `${BUTTON} border border-gray-300 text-gray-800 hover:bg-gray-50`;
  const primary = `${BUTTON} bg-brand-700 text-white hover:bg-brand-800`;

  if (status === "published") {
    return <button disabled={pending} className={primary}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>;
  }
  return (
    <div className="space-y-2">
      <button name="intent" value="publish" disabled={pending} className={primary}>
        {pending && publishing ? "Đang xuất bản..." : status === "archived" ? "Lưu và đăng lại" : "Lưu và xuất bản"}
      </button>
      <button disabled={pending} className={secondary}>
        {saving ? "Đang lưu..." : status === "archived" ? "Lưu thay đổi" : "Lưu bản nháp"}
      </button>
    </div>
  );
}

// Tải ảnh ngay khi chọn, form chỉ giữ URL: lỗi lưu bài không làm mất ảnh đã chọn
function ThumbnailField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      setError("Ảnh tối đa 4MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await uploadPostImage(form);
      if (result.url) onChange(result.url);
      else setError(result.error ?? "Tải ảnh thất bại.");
    } catch {
      setError("Tải ảnh thất bại. Ảnh có thể quá lớn, hãy thử ảnh nhỏ hơn.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className={LABEL}>Ảnh bìa</p>
      <div className="mt-2 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : uploading ? "Đang tải ảnh..." : "Chưa có ảnh"}
      </div>
      <input type="hidden" name="thumbnail_url" value={value} />
      <label className="mt-3 block text-sm font-medium text-gray-700">
        <span className="sr-only">Chọn ảnh bìa</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void pick(file);
          }}
          className="block w-full cursor-pointer text-sm font-normal text-gray-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-normal text-gray-600">
        <span>Tỉ lệ 16:9, ví dụ 1200×675. Tối đa 4MB.</span>
        {value && <button type="button" onClick={() => onChange("")} className="cursor-pointer rounded py-1 font-medium text-red-700 hover:underline">Bỏ ảnh</button>}
      </div>
      {error && <p className="mt-2 text-sm font-normal text-red-700" role="alert">{error}</p>}
    </div>
  );
}

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
