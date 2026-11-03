"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { AdminPostStatus } from "@/lib/admin-types";

// Các phần dùng chung của form soạn nội dung dài: bài viết và dự án
export const LABEL = "block text-sm font-medium text-gray-700";
export const INPUT =
  "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent";
export const CARD = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";
const BUTTON = "inline-flex w-full min-h-11 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

export function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`mt-1 block text-xs font-normal tabular-nums ${value.length > max ? "text-red-700" : "text-gray-600"}`}>
      {value.length}/{max} ký tự nên dùng
    </span>
  );
}

export function SaveButtons({
  status,
  pending,
  publishing,
  disabled = false,
}: {
  status: AdminPostStatus;
  pending: boolean;
  publishing: boolean;
  disabled?: boolean;
}) {
  const saving = pending && !publishing;
  const secondary = `${BUTTON} border border-gray-300 text-gray-800 hover:bg-gray-50`;
  const primary = `${BUTTON} bg-brand-700 text-white hover:bg-brand-800`;

  if (status === "published") {
    return <button disabled={pending || disabled} className={primary}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>;
  }
  return (
    <div className="space-y-2">
      <button name="intent" value="publish" disabled={pending || disabled} className={primary}>
        {pending && publishing ? "Đang xuất bản..." : status === "archived" ? "Lưu và đăng lại" : "Lưu và xuất bản"}
      </button>
      <button disabled={pending || disabled} className={secondary}>
        {saving ? "Đang lưu..." : status === "archived" ? "Lưu thay đổi" : "Lưu bản nháp"}
      </button>
    </div>
  );
}

// Tải ảnh ngay khi chọn, form chỉ giữ URL: lỗi lưu bài không làm mất ảnh đã chọn
export function ThumbnailField({
  value,
  upload,
  onChange,
}: {
  value: string;
  upload: (form: FormData) => Promise<{ url?: string; error?: string }>;
  onChange: (url: string) => void;
}) {
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
      const result = await upload(form);
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
