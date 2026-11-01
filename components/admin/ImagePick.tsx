"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

// Ô chọn ảnh: ảnh hiện tại nằm trong input ẩn (name), ảnh mới chọn nằm trong input file (file__name)
export default function ImagePick({ name, value }: { name: string; value: string }) {
  const [current, setCurrent] = useState(value);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const shown = preview ?? (current || null);

  return (
    <div className="mt-2 flex items-start gap-4">
      <div className="w-28 h-20 shrink-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center text-xs text-gray-400">
        {shown ? <img src={shown} alt="" className="w-full h-full object-cover" /> : "Chưa có ảnh"}
      </div>
      <div className="flex-1">
        <input type="hidden" name={name} value={current} />
        <input
          ref={fileRef}
          name={"file__" + name}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 4 * 1024 * 1024) {
              alert("Ảnh tối đa 4MB");
              e.target.value = "";
              return;
            }
            setPreview(URL.createObjectURL(f));
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 file:cursor-pointer"
        />
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 font-normal">
          <span>{current ? "Không chọn file mới thì giữ ảnh hiện tại. " : ""}Tối đa 4MB.</span>
          {shown && (
            <button
              type="button"
              onClick={() => {
                setCurrent("");
                setPreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-red-600 hover:underline"
            >
              Bỏ ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}