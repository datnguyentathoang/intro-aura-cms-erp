import { cache } from "react"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import type { BlogPostList, Contact, Faq, Feature, Hero, Screenshot, Workflow, MenuNode, PublicPage } from "@/lib/types";

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

const EMPTY_HOME: HomeData = {
  hero: null,
  features: [],
  workflows: [],
  screenshots: [],
  faqs: [],
  contact: null,
};

export async function getHome(): Promise<HomeData> {
  try {
    const res = await fetch(apiUrl("/api/public/home"), { cache: "no-store" });
    if (!res.ok) return EMPTY_HOME;
    const data = (await res.json()) as Partial<HomeData>;
    return {
      hero: data.hero ?? null,
      features: Array.isArray(data.features) ? data.features : [],
      workflows: Array.isArray(data.workflows) ? data.workflows : [],
      screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      contact: data.contact ?? null,
    };
  } catch {
    return EMPTY_HOME;
  }
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

// ---------- Trang động và menu (công khai) ----------
function publicFetch(path: string, timeoutMs: number) {
  return fetch(apiUrl(path), { cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
}

// 404 -> null (trang không tồn tại). Lỗi khác -> ném lỗi, tránh biến sự cố tạm thời thành 404
export const getPage = cache(async (slug: string): Promise<PublicPage | null> => {
  const res = await publicFetch(`/api/public/pages/${encodeURIComponent(slug)}`, 15000);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  return (await res.json()) as PublicPage;
});

// Menu và sitemap chịu lỗi: có sự cố thì trả mảng rỗng, website vẫn hiển thị
export const getMenu = cache(async (): Promise<MenuNode[]> => {
  try {
    const res = await publicFetch("/api/public/menu", 4000);
    return res.ok ? ((await res.json()) as MenuNode[]) : [];
  } catch {
    return [];
  }
});

export async function getPublishedPages(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const res = await publicFetch("/api/public/pages", 8000);
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export const getHomeSafe = cache(async (): Promise<HomeData | null> => {
  try {
    return await getHome();
  } catch {
    return null;
  }
});

// ---------- Blog (công khai) ----------
// 10 bài mỗi trang: 1 thẻ lớn + 9 thẻ nhỏ lấp đủ lưới 3 cột
const BLOG_PAGE_SIZE = 10;

// Lỗi API -> ném lỗi, tránh hiển thị nhầm thành "chưa có bài viết"
export async function getBlogPosts(page = 1): Promise<BlogPostList> {
  const res = await publicFetch(`/api/public/blog/posts?page=${page}&page_size=${BLOG_PAGE_SIZE}`, 15000);
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  const d = (await res.json()) as Partial<BlogPostList>;
  return {
    items: Array.isArray(d.items) ? d.items : [],
    total: typeof d.total === "number" ? d.total : 0,
    page: typeof d.page === "number" ? d.page : page,
    page_size: typeof d.page_size === "number" && d.page_size > 0 ? d.page_size : BLOG_PAGE_SIZE,
  };
}
