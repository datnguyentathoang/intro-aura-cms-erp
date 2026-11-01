import { SCHEMAS, type Field } from "@/lib/section-schemas";
import { rethrowRedirect, uploadImageFile } from "@/lib/upload";

type Built = { content: Record<string, unknown> } | { error: string };

async function readField(f: Field, key: string, form: FormData): Promise<{ value?: unknown; error?: string }> {
  switch (f.type) {
    case "checkbox":
      return { value: form.get(key) === "on" };
    case "lines":
      return { value: String(form.get(key) ?? "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 30) };
    case "image": {
      const file = form.get("file__" + key);
      if (file instanceof File && file.size > 0) {
        try {
          return { value: await uploadImageFile(file, "misc") };
        } catch (e) {
          rethrowRedirect(e);
          return { error: `${f.label}: ${e instanceof Error ? e.message : "tải ảnh thất bại"}` };
        }
      }
      return { value: String(form.get(key) ?? "").trim() };
    }
    default:
      return { value: String(form.get(key) ?? "").trim().slice(0, f.type === "html" ? 60000 : 5000) };
  }
}

const isEmpty = (v: unknown) => v === "" || v === undefined || (Array.isArray(v) && v.length === 0);

export async function buildContent(type: string, form: FormData): Promise<Built> {
  const schema = SCHEMAS[type];
  if (!schema) return { error: "Loại section không hợp lệ" };

  const content: Record<string, unknown> = {};
  for (const f of schema.fields) {
    const r = await readField(f, `f__${f.name}`, form);
    if (r.error) return { error: r.error };
    if (f.required && isEmpty(r.value)) return { error: `Vui lòng nhập: ${f.label}` };
    content[f.name] = r.value;
  }

  for (const def of schema.lists ?? []) {
    const re = new RegExp(`^l__${def.name}__(\\d+)__`);
    const idx = new Set<number>();
    for (const k of form.keys()) {
      const m = re.exec(k);
      if (m && Number(m[1]) < 200) idx.add(Number(m[1]));
    }

    const items: Record<string, unknown>[] = [];
    for (const i of [...idx].sort((a, b) => a - b)) {
      const item: Record<string, unknown> = {};
      let filled = false;
      for (const f of def.fields) {
        const r = await readField(f, `l__${def.name}__${i}__${f.name}`, form);
        if (r.error) return { error: r.error };
        item[f.name] = r.value;
        if (f.type !== "checkbox" && !isEmpty(r.value)) filled = true;
      }
      if (!filled) continue; // bỏ qua dòng để trống
      const n = items.length + 1;
      for (const f of def.fields) {
        if (f.required && isEmpty(item[f.name])) return { error: `${def.itemLabel} ${n}: vui lòng nhập ${f.label}` };
      }
      items.push(item);
      if (items.length >= def.max) break;
    }
    content[def.name] = items;
  }
  return { content };
}