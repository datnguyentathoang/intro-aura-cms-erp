"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import ImagePick from "@/components/admin/ImagePick";
import type { Field, ListDef, SectionSchema } from "@/lib/section-schemas";

const input =
  "mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";
const toggle =
  "relative w-11 h-6 shrink-0 rounded-full bg-gray-300 peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5";
const tbtn = "px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-brand-100 hover:text-brand-700 transition-colors";

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Trình soạn HTML đơn giản: ô văn bản kèm nút chèn thẻ. HTML được API làm sạch khi lưu.
function HtmlEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const put = (html: string, selStart: number, selEnd: number, a: number, b: number) => {
    const el = ref.current;
    if (!el) return;
    el.value = el.value.slice(0, a) + html + el.value.slice(b);
    el.focus();
    el.setSelectionRange(selStart, selEnd);
  };
  const wrap = (before: string, after: string, placeholder: string) => {
    const el = ref.current;
    if (!el) return;
    const a = el.selectionStart, b = el.selectionEnd;
    const sel = el.value.slice(a, b) || placeholder;
    put(before + sel + after, a + before.length, a + before.length + sel.length, a, b);
  };
  const list = (tag: "ul" | "ol") => {
    const el = ref.current;
    if (!el) return;
    const a = el.selectionStart, b = el.selectionEnd;
    const sel = el.value.slice(a, b) || "Mục 1\nMục 2";
    const lis = sel.split(/\r?\n/).filter((l) => l.trim()).map((l) => `  <li>${l.trim()}</li>`).join("\n");
    const html = `<${tag}>\n${lis}\n</${tag}>`;
    put(html, a, a + html.length, a, b);
  };
  const link = () => {
    const url = window.prompt("Địa chỉ liên kết (https://… hoặc /duong-dan):");
    if (!url) return;
    if (!/^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i.test(url.trim())) {
      alert("Địa chỉ không hợp lệ");
      return;
    }
    wrap(`<a href="${escAttr(url.trim())}">`, "</a>", "văn bản liên kết");
  };

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button type="button" className={tbtn} onClick={() => wrap("<strong>", "</strong>", "chữ đậm")}><b>B</b></button>
        <button type="button" className={tbtn} onClick={() => wrap("<em>", "</em>", "chữ nghiêng")}><i>I</i></button>
        <button type="button" className={tbtn} onClick={() => wrap("<h2>", "</h2>", "Tiêu đề lớn")}>H2</button>
        <button type="button" className={tbtn} onClick={() => wrap("<h3>", "</h3>", "Tiêu đề nhỏ")}>H3</button>
        <button type="button" className={tbtn} onClick={() => wrap("<p>", "</p>", "Đoạn văn")}>Đoạn</button>
        <button type="button" className={tbtn} onClick={() => list("ul")}>• Danh sách</button>
        <button type="button" className={tbtn} onClick={() => list("ol")}>1. Danh sách</button>
        <button type="button" className={tbtn} onClick={() => wrap("<blockquote>", "</blockquote>", "Trích dẫn")}>Trích dẫn</button>
        <button type="button" className={tbtn} onClick={link}>Liên kết</button>
      </div>
      <textarea
        ref={ref}
        name={name}
        rows={14}
        defaultValue={defaultValue}
        className={`${input} font-mono text-sm`}
        placeholder="<p>Nội dung…</p>"
      />
      <p className="mt-1 text-xs text-gray-500 font-normal">
        Mã nguy hiểm (script...) bị loại bỏ khi lưu. Lưu rồi bấm Xem trước ở trang để xem kết quả thật.
      </p>
    </div>
  );
}

function FieldInput({ f, name, init }: { f: Field; name: string; init: unknown }) {
  const label = (
    <span className="text-sm font-medium text-gray-700">
      {f.label}
      {f.required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
  );
  const help = f.help ? <span className="block text-xs text-gray-500 font-normal mt-1">{f.help}</span> : null;

  switch (f.type) {
    case "checkbox":
      return (
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input name={name} type="checkbox" defaultChecked={init === true} className="peer sr-only" />
          <span className={toggle} />
          <span className="text-sm font-medium text-gray-700">{f.label}</span>
        </label>
      );
    case "select":
      return (
        <label className="block">
          {label}
          <select name={name} defaultValue={String(init ?? f.options?.[0]?.value ?? "")} className={input}>
            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      );
    case "image":
      return (
        <div>
          {label}
          <ImagePick name={name} value={typeof init === "string" ? init : ""} />
        </div>
      );
    case "html":
      return (
        <div>
          {label}
          <HtmlEditor name={name} defaultValue={typeof init === "string" ? init : ""} />
        </div>
      );
    case "lines":
      return (
        <label className="block">
          {label}
          <textarea name={name} rows={4} defaultValue={Array.isArray(init) ? init.join("\n") : ""} className={input} />
          {help}
        </label>
      );
    case "textarea":
      return (
        <label className="block">
          {label}
          <textarea name={name} rows={4} defaultValue={typeof init === "string" ? init : ""} required={f.required} className={input} />
          {help}
        </label>
      );
    default:
      return (
        <label className="block">
          {label}
          <input name={name} defaultValue={typeof init === "string" ? init : ""} required={f.required} className={input} />
          {help}
        </label>
      );
  }
}

type Row = { id: number; init: Record<string, unknown> };

function ListEditor({ def, initial }: { def: ListDef; initial: Record<string, unknown>[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.slice(0, def.max).map((init, i) => ({ id: i + 1, init })));
  const [nextId, setNextId] = useState(initial.length + 1);

  const add = () => {
    setRows((r) => [...r, { id: nextId, init: {} }]);
    setNextId((n) => n + 1);
  };
  const remove = (i: number) => setRows((r) => r.filter((_, k) => k !== i));
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{def.label} ({rows.length}/{def.max})</h3>
        <button
          type="button"
          onClick={add}
          disabled={rows.length >= def.max}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ＋ Thêm {def.itemLabel.toLowerCase()}
        </button>
      </div>

      {rows.length === 0 && <p className="text-sm text-gray-500">Chưa có mục nào. Bấm Thêm để tạo.</p>}

      {rows.map((row, i) => (
        <div key={row.id} className="rounded-xl border border-gray-200 p-4 space-y-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{def.itemLabel} {i + 1}</span>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 rounded-lg bg-slate-100 text-sm hover:bg-brand-100 disabled:opacity-30 disabled:cursor-not-allowed">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="w-8 h-8 rounded-lg bg-slate-100 text-sm hover:bg-brand-100 disabled:opacity-30 disabled:cursor-not-allowed">↓</button>
              <button type="button" onClick={() => remove(i)} className="px-3 h-8 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100">Xóa</button>
            </div>
          </div>
          {def.fields.map((f) => (
            <FieldInput key={f.name} f={f} name={`l__${def.name}__${i}__${f.name}`} init={row.init[f.name]} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SectionForm({
  schema, content, isPublished, action, cancelHref,
}: {
  schema: SectionSchema;
  content: Record<string, unknown>;
  isPublished: boolean;
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5">
        {schema.fields.map((f) => (
          <FieldInput key={f.name} f={f} name={`f__${f.name}`} init={content[f.name]} />
        ))}
      </div>

      {schema.lists?.map((def) => (
        <ListEditor
          key={def.name}
          def={def}
          initial={Array.isArray(content[def.name]) ? (content[def.name] as Record<string, unknown>[]) : []}
        />
      ))}

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input name="is_published" type="checkbox" defaultChecked={isPublished} className="peer sr-only" />
          <span className={toggle} />
          <span className="text-sm font-medium text-gray-700">Hiển thị section này trên website</span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <SubmitButton label="Lưu section" />
        <Link href={cancelHref} className="text-sm font-medium text-gray-600 hover:underline">Quay lại trang</Link>
      </div>
    </form>
  );
}