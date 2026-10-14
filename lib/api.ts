import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import type { Contact, Faq, Feature, Hero, Screenshot, Workflow } from "@/lib/types";

function apiUrl(path: string) {
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error("Thiếu biến môi trường API_BASE_URL");
  return `${base.replace(/\/$/, "")}${path}`;
}

export type HomeData = {
  hero: Hero | null;
  features: Feature[];
  workflows: Workflow[];
  screenshots: Screenshot[];
  faqs: Faq[];
  contact: Contact | null;
};

export async function getHome(): Promise<HomeData> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/api/public/home"), { cache: "no-store" });
  } catch {
    throw new Error("Không kết nối được máy chủ API");
  }
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  return res.json();
}

export async function publicPost(path: string, json: unknown) {
  return fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
    cache: "no-store",
  });
}

type Opts = { method?: string; json?: unknown; form?: FormData };

// Gọi API admin kèm access token trong cookie. Hết phiên thì về trang đăng nhập.
export async function adminFetch(path: string, opts: Opts = {}): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method: opts.method ?? "GET",
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    throw new Error("Không kết nối được máy chủ API");
  }
  if (res.status === 401) redirect("/admin/login");
  return res;
}

async function errorOf(res: Response) {
  try {
    const b = await res.json();
    if (b?.error) return String(b.error);
    if (b?.errors) return Object.values(b.errors).flat().join(", ");
    if (b?.title) return String(b.title);
  } catch {}
  return `Lỗi ${res.status}`;
}

export async function ensureOk(res: Response) {
  if (!res.ok) throw new Error(await errorOf(res));
}

// GET trả JSON, không có dữ liệu thì trả null
export async function adminJson<T>(path: string): Promise<T | null> {
  const res = await adminFetch(path);
  if (res.status === 404 || res.status === 204) return null;
  await ensureOk(res);
  return (await res.json()) as T;
}

// Lấy logo và tên thương hiệu cho trang admin. Lỗi hoặc API đang ngủ thì trả null.
export async function getBrand(): Promise<{ logoUrl: string | null; brandName: string | null }> {
  try {
    const res = await fetch(apiUrl("/api/public/home"), {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { logoUrl: null, brandName: null };
    const d = (await res.json()) as HomeData;
    return { logoUrl: d.hero?.logo_url ?? null, brandName: d.hero?.brand_name ?? null };
  } catch {
    return { logoUrl: null, brandName: null };
  }
}