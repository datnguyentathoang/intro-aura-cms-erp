"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { safeSrc } from "@/lib/safe";
import type { ProjectImage } from "@/lib/types";

const MAX_IMAGES = 30;
const MAX_BYTES = 4 * 1024 * 1024;
const ICON_BUTTON = "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-700 hover:bg-brand-100 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 transition-colors motion-reduce:transition-none";

type Item = { key: number; image_url: string; caption: string };

// Thư viện ảnh của dự án. Ảnh tải lên ngay khi chọn; danh sách URL và chú thích nằm trong một ô ẩn dạng JSON,
// nên lỗi lưu dự án không làm mất ảnh đã chọn.
export default function GalleryField({
  initial,
  upload,
  onChange,
  onUploading,
}: {
  initial: ProjectImage[];
  upload: (form: FormData) => Promise<{ url?: string; error?: string }>;
  onChange: () => void;
  onUploading: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<Item[]>(() =>
    initial.map((img, i) => ({ key: i + 1, image_url: img.image_url, caption: img.caption ?? "" }))
  );
  const nextKey = useRef(initial.length + 1);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Đổi thứ tự có thể làm nút đang chọn mất focus, nên trả focus về đúng ảnh vừa di chuyển
  const listRef = useRef<HTMLUListElement>(null);
  const movedKey = useRef<number | null>(null);
  useEffect(() => {
    if (movedKey.current === null) return;
    const row = listRef.current?.querySelector(`[data-key="${movedKey.current}"]`);
    movedKey.current = null;
    row?.querySelector<HTMLButtonElement>("button[data-move]:not(:disabled)")?.focus();
  }, [items]);

  async function pick(files: File[]) {
    const room = MAX_IMAGES - items.length;
    const problems: string[] = [];
    if (files.length > room) problems.push(`Thư viện tối đa ${MAX_IMAGES} ảnh, ${files.length - Math.max(room, 0)} ảnh không được thêm.`);
    const accepted = files.slice(0, Math.max(room, 0));

    setErrors(problems);
    if (accepted.length === 0) return;
    onUploading(true);
    setProgress({ done: 0, total: accepted.length });
    // Tải lần lượt: mỗi ảnh một request để không vượt giới hạn dung lượng của một request
    for (const [i, file] of accepted.entries()) {
      try {
        if (file.size > MAX_BYTES) throw new Error("ảnh tối đa 4MB");
        const form = new FormData();
        form.append("file", file);
        const result = await upload(form);
        if (!result.url) throw new Error(result.error ?? "tải ảnh thất bại");
        const url = result.url;
        setItems((cur) => [...cur, { key: nextKey.current++, image_url: url, caption: "" }]);
        onChange();
      } catch (e) {
        problems.push(`${file.name}: ${e instanceof Error ? e.message : "tải ảnh thất bại"}`);
        setErrors([...problems]);
      }
      setProgress({ done: i + 1, total: accepted.length });
    }
    setProgress(null);
    onUploading(false);
  }

  function move(index: number, by: -1 | 1) {
    movedKey.current = items[index].key;
    setItems((cur) => {
      const next = [...cur];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
    onChange();
  }

  const value = items.map((i) => ({ image_url: i.image_url, caption: i.caption.trim() || null }));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Thư viện ảnh</h2>
        <span className="text-sm tabular-nums text-gray-600">{items.length}/{MAX_IMAGES} ảnh</span>
      </div>
      <input type="hidden" name="images" value={JSON.stringify(value)} />

      {items.length > 0 && (
        <ul ref={listRef} className="mt-4 space-y-3">
          {items.map((item, i) => {
            const src = safeSrc(item.image_url);
            return (
              <li key={item.key} data-key={item.key} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {src && <img src={src} alt="" className="h-full w-full object-cover" />}
                </div>
                <label className="min-w-48 flex-1 text-sm font-medium text-gray-700">
                  <span className="sr-only">Chú thích ảnh {i + 1}</span>
                  <input
                    value={item.caption}
                    maxLength={300}
                    placeholder="Chú thích (không bắt buộc)"
                    onChange={(e) => {
                      const caption = e.target.value;
                      setItems((cur) => cur.map((x) => (x.key === item.key ? { ...x, caption } : x)));
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
                <div className="flex items-center gap-1">
                  <button type="button" data-move disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Chuyển ảnh ${i + 1} lên`} className={ICON_BUTTON}>↑</button>
                  <button type="button" data-move disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Chuyển ảnh ${i + 1} xuống`} className={ICON_BUTTON}>↓</button>
                  <button
                    type="button"
                    onClick={() => {
                      setItems((cur) => cur.filter((x) => x.key !== item.key));
                      onChange();
                    }}
                    aria-label={`Bỏ ảnh ${i + 1}`}
                    className="inline-flex h-9 cursor-pointer items-center rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors motion-reduce:transition-none"
                  >
                    Bỏ
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <label className="mt-4 block text-sm font-medium text-gray-700">
        <span className="sr-only">Thêm ảnh vào thư viện</span>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp"
          disabled={progress !== null || items.length >= MAX_IMAGES}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length > 0) void pick(files);
          }}
          className="block w-full cursor-pointer text-sm font-normal text-gray-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <p className="mt-2 text-xs text-gray-600" role="status">
        {progress ? `Đang tải ảnh ${progress.done + 1}/${progress.total}...` : "Chọn được nhiều ảnh cùng lúc. Mỗi ảnh tối đa 4MB. Ảnh được cắt theo tỉ lệ 16:9 trong lưới; bấm vào ảnh trên website sẽ thấy ảnh đầy đủ."}
      </p>
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-red-700 [overflow-wrap:anywhere]" role="alert">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}
