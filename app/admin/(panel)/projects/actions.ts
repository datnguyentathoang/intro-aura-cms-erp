"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi, withError, type ApiResult } from "@/lib/admin-call";
import { rethrowRedirect, uploadImageFile } from "@/lib/upload";

export type ProjectFormState = { error?: string };

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

// Thư viện ảnh nằm trong một ô ẩn dạng JSON; API kiểm tra lại từng đường dẫn
function galleryOf(form: FormData): unknown[] {
  try {
    const data = JSON.parse(String(form.get("images") ?? "[]"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Trả lỗi về form thay vì chuyển trang, để người viết không mất nội dung đang soạn
export async function saveProject(id: string | null, _prev: ProjectFormState, form: FormData): Promise<ProjectFormState> {
  const body = {
    title: text(form, "title"),
    slug: text(form, "slug"),
    client_name: text(form, "client_name") || null,
    industry: text(form, "industry") || null,
    summary: text(form, "summary") || null,
    content: String(form.get("content") ?? ""),
    thumbnail_url: text(form, "thumbnail_url") || null,
    seo_title: text(form, "seo_title") || null,
    seo_description: text(form, "seo_description") || null,
    images: galleryOf(form),
  };

  let saved: ApiResult<{ id: string }>;
  try {
    saved = await callApi<{ id: string }>(id ? `/api/admin/projects/${id}` : "/api/admin/projects", {
      method: id ? "PUT" : "POST",
      json: body,
    });
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Không lưu được dự án" };
  }
  if (!saved.ok || !saved.data) return { error: saved.error ?? "Không lưu được dự án" };

  const path = `/admin/projects/${saved.data.id}`;
  revalidatePath("/admin/projects");
  if (form.get("intent") !== "publish") redirect(`${path}?saved=1`);

  // Dự án đã lưu xong, nếu chưa xuất bản được thì mở trang sửa và báo lỗi: nội dung không bị mất
  const published = await callApi(`/api/admin/projects/${saved.data.id}/publish`, { method: "POST" });
  if (!published.ok) redirect(withError(path, published.error ?? "Không xuất bản được dự án"));
  redirect(`${path}?published=1`);
}

export async function setProjectStatus(id: string, action: "publish" | "unpublish", returnTo: string) {
  const r = await callApi(`/api/admin/projects/${id}/${action}`, { method: "POST" });
  if (!r.ok) redirect(withError(returnTo, r.error ?? "Không đổi được trạng thái"));
  revalidatePath("/admin/projects");
  redirect(returnTo);
}

export async function moveProject(id: string, direction: "up" | "down") {
  const r = await callApi(`/api/admin/projects/${id}/move?direction=${direction}`, { method: "POST" });
  if (!r.ok) redirect(withError("/admin/projects", r.error ?? "Không đổi được thứ tự"));
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  const r = await callApi(`/api/admin/projects/${id}`, { method: "DELETE" });
  if (!r.ok) redirect(withError("/admin/projects", r.error ?? "Không xóa được dự án"));
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function uploadProjectImage(form: FormData): Promise<{ url?: string; error?: string }> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Chưa chọn ảnh" };
  try {
    return { url: await uploadImageFile(file, "projects") };
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Tải ảnh thất bại" };
  }
}
