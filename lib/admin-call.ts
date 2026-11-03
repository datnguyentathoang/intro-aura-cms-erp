import { adminFetch } from "@/lib/api";

export type ApiResult<T> = { ok: boolean; status: number; data: T | null; error: string | null };

export async function callApi<T = unknown>(
  path: string,
  opts: { method?: string; json?: unknown } = {},
): Promise<ApiResult<T>> {
  const res = await adminFetch(path, opts);
  let body: unknown = null;
  if (res.status !== 204) {
    try { body = await res.json(); } catch { body = null; }
  }
  if (res.ok) return { ok: true, status: res.status, data: body as T | null, error: null };

  let error = `Lỗi ${res.status}`;
  if (body && typeof body === "object") {
    const b = body as { error?: unknown; errors?: unknown; title?: unknown };
    if (typeof b.error === "string") error = b.error;
    else if (b.errors && typeof b.errors === "object")
      error = Object.values(b.errors as Record<string, unknown>).flat().join(", ");
    else if (typeof b.title === "string") error = b.title;
  }
  return { ok: false, status: res.status, data: null, error };
}

// Gắn thông báo lỗi vào đường dẫn để trang đích hiển thị
export function withError(path: string, error: string) {
  const url = new URL(path, "http://x");
  url.searchParams.set("error", error);
  return url.pathname + url.search;
}
