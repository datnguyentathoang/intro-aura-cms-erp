export const s = (v: unknown, max = 5000): string => (typeof v === "string" ? v.slice(0, max) : "");

export const list = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x)).slice(0, 50)
    : [];

export const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 30) : [];

// Link: chỉ cho phép đường dẫn nội bộ, #, http(s), mailto, tel
export function safeHref(v: unknown): string {
  const u = s(v, 500).trim();
  if (/\s/.test(u)) return "#";
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  if (u.startsWith("#")) return u;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(u)) return u;
  return "#";
}

// Ảnh: chỉ cho phép đường dẫn nội bộ hoặc http(s)
export function safeSrc(v: unknown): string | null {
  const u = s(v, 1000).trim();
  if (!u || /\s/.test(u)) return null;
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}