import { cache } from "react"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import type { BlogQuery } from "@/lib/blog";
import { list } from "@/lib/safe";
import type { BlogCategory, BlogPostData, BlogPostList, Contact, Faq, Feature, Hero, Screenshot, Workflow, MenuNode, ProjectData, ProjectListItem, PublicPage, PublicPricingPlan, PublicSection, PublicTeamMember, PublicTestimonial } from "@/lib/types";

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
export async function getBlogPosts(query: Pick<BlogQuery, "page" | "category" | "q">): Promise<BlogPostList> {
  const params = new URLSearchParams({ page: String(query.page), page_size: String(BLOG_PAGE_SIZE) });
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  const res = await publicFetch(`/api/public/blog/posts?${params}`, 15000);
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  const d = (await res.json()) as Partial<BlogPostList>;
  return {
    items: Array.isArray(d.items) ? d.items : [],
    total: typeof d.total === "number" ? d.total : 0,
    page: typeof d.page === "number" ? d.page : query.page,
    page_size: typeof d.page_size === "number" && d.page_size > 0 ? d.page_size : BLOG_PAGE_SIZE,
  };
}

// 404 -> null (bài không tồn tại hoặc chưa xuất bản). Lỗi khác -> ném lỗi, tránh biến sự cố tạm thời thành 404
export const getBlogPost = cache(async (slug: string): Promise<BlogPostData | null> => {
  const res = await publicFetch(`/api/public/blog/posts/${encodeURIComponent(slug)}`, 15000);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  const d = (await res.json()) as Partial<BlogPostData>;
  if (!d.post) return null;
  return { post: d.post, related: Array.isArray(d.related) ? d.related : [] };
});

// Chuyên mục và sitemap chịu lỗi: có sự cố thì trả mảng rỗng, trang vẫn hiển thị
export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  try {
    const res = await publicFetch("/api/public/blog/categories", 8000);
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
});

export async function getBlogSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const res = await publicFetch("/api/public/blog/slugs", 8000);
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ---------- Dự án, đội ngũ, đánh giá, bảng giá (công khai) ----------
// Nội dung chính của trang. Lỗi API -> ném lỗi, tránh hiển thị nhầm thành "chưa có dữ liệu"
async function requiredList<T>(path: string): Promise<T[]> {
  const res = await publicFetch(path, 15000);
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Phần phụ của trang và sitemap. Có sự cố thì trả mảng rỗng, trang vẫn hiển thị
async function optionalList<T>(path: string): Promise<T[]> {
  try {
    const res = await publicFetch(path, 8000);
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export const getProjects = cache(() => requiredList<ProjectListItem>("/api/public/portfolio/projects"));

// 404 -> null (dự án không tồn tại hoặc chưa xuất bản). Lỗi khác -> ném lỗi, tránh biến sự cố tạm thời thành 404
export const getProject = cache(async (slug: string): Promise<ProjectData | null> => {
  const res = await publicFetch(`/api/public/portfolio/projects/${encodeURIComponent(slug)}`, 15000);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API trả về lỗi ${res.status}`);
  const d = (await res.json()) as Partial<ProjectData>;
  if (!d.project) return null;
  return {
    project: { ...d.project, images: Array.isArray(d.project.images) ? d.project.images : [] },
    related: Array.isArray(d.related) ? d.related : [],
  };
});

export function getProjectSlugs() {
  return optionalList<{ slug: string; updated_at: string }>("/api/public/portfolio/slugs");
}

// Gói chưa nhập nút hoặc link vẫn có đường liên hệ
export const getPricingPlans = cache(async () => {
  const plans = await requiredList<PublicPricingPlan>("/api/public/pricing");
  return plans.map((p) => ({ ...p, cta_text: p.cta_text || "Liên hệ tư vấn", cta_link: p.cta_link || "/#contact" }));
});

export const getTeamMembers = cache(() => optionalList<PublicTeamMember>("/api/public/team"));

export const getTestimonials = cache(() => optionalList<PublicTestimonial>("/api/public/testimonials"));

const SHARED_LISTS: Record<string, { field: string; load: () => Promise<unknown[]> }> = {
  team: { field: "members", load: getTeamMembers },
  testimonials: { field: "items", load: getTestimonials },
  pricing: { field: "plans", load: () => getPricingPlans().catch(() => []) },
};

// Section đội ngũ, đánh giá, bảng giá để trống danh sách thì dùng dữ liệu chung nhập trong admin.
// Chỉ gọi API khi trang thật sự có section như vậy.
export function withSharedLists(sections: PublicSection[]): Promise<PublicSection[]> {
  return Promise.all(sections.map(async (sec) => {
    const shared = SHARED_LISTS[sec.type];
    const content = sec.content && typeof sec.content === "object" ? sec.content : {};
    if (!shared || list(content[shared.field]).length > 0) return sec;
    return { ...sec, content: { ...content, [shared.field]: await shared.load() } };
  }));
}
