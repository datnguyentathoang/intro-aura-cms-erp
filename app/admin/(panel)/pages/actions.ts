"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi } from "@/lib/admin-call";
import { buildContent } from "@/lib/section-content";
import { rethrowRedirect, uploadImageFile } from "@/lib/upload";
import { SCHEMAS } from "@/lib/section-schemas";

function back(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

async function readMeta(form: FormData): Promise<{ body: Record<string, unknown> } | { error: string }> {
  let og = String(form.get("og_image_url") ?? "").trim();
  const file = form.get("file__og_image_url");
  if (file instanceof File && file.size > 0) {
    try {
      og = await uploadImageFile(file, "misc");
    } catch (e) {
      rethrowRedirect(e);
      return { error: `Tải ảnh thất bại: ${e instanceof Error ? e.message : "lỗi không rõ"}` };
    }
  }
  return {
    body: {
      title: String(form.get("title") ?? "").trim(),
      slug: String(form.get("slug") ?? "").trim(),
      seo_title: String(form.get("seo_title") ?? "").trim() || null,
      seo_description: String(form.get("seo_description") ?? "").trim() || null,
      og_image_url: og || null,
    },
  };
}

export async function createPage(form: FormData) {
  const meta = await readMeta(form);
  if ("error" in meta) back("/admin/pages/new", meta.error);
  const r = await callApi<{ id: string }>("/api/admin/pages", { method: "POST", json: meta.body });
  if (!r.ok || !r.data) back("/admin/pages/new", r.error ?? "Không tạo được trang");
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${r.data.id}`);
}

export async function updatePage(id: string, form: FormData) {
  const path = `/admin/pages/${id}`;
  const meta = await readMeta(form);
  if ("error" in meta) back(path, meta.error);
  const r = await callApi(`/api/admin/pages/${id}`, { method: "PUT", json: meta.body });
  if (!r.ok) back(path, r.error ?? "Không lưu được");
  revalidatePath("/admin/pages");
  redirect(`${path}?saved=1`);
}

export async function deletePage(id: string) {
  const r = await callApi(`/api/admin/pages/${id}`, { method: "DELETE" });
  if (!r.ok) back("/admin/pages", r.error ?? "Không xóa được");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function setPublished(id: string, publish: boolean) {
  const r = await callApi(`/api/admin/pages/${id}/${publish ? "publish" : "unpublish"}`, { method: "POST" });
  if (!r.ok) back(`/admin/pages/${id}`, r.error ?? "Không đổi được trạng thái");
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}`);
}

export async function addSection(pageId: string, form: FormData) {
  const path = `/admin/pages/${pageId}`;
  const type = String(form.get("type") ?? "");
  if (!SCHEMAS[type]) back(path, "Hãy chọn loại section");
  // Tạo ở trạng thái ẩn để section trống không hiện ra website
  const r = await callApi<{ id: string }>(`/api/admin/pages/${pageId}/sections`, {
    method: "POST", json: { type, content: {}, is_published: false },
  });
  if (!r.ok || !r.data) back(path, r.error ?? "Không thêm được section");
  revalidatePath(path);
  redirect(`${path}/sections/${r.data.id}`);
}

export async function saveSection(pageId: string, sectionId: string, type: string, form: FormData) {
  const path = `/admin/pages/${pageId}/sections/${sectionId}`;
  const built = await buildContent(type, form);
  if ("error" in built) back(path, built.error);
  const r = await callApi(`/api/admin/pages/${pageId}/sections/${sectionId}`, {
    method: "PUT",
    json: { content: built.content, is_published: form.get("is_published") === "on" },
  });
  if (!r.ok) back(path, r.error ?? "Không lưu được section");
  revalidatePath(`/admin/pages/${pageId}`);
  redirect(`/admin/pages/${pageId}?saved=section`);
}

export async function deleteSection(pageId: string, sectionId: string) {
  const r = await callApi(`/api/admin/pages/${pageId}/sections/${sectionId}`, { method: "DELETE" });
  if (!r.ok) back(`/admin/pages/${pageId}`, r.error ?? "Không xóa được");
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function moveSection(pageId: string, sectionId: string, direction: "up" | "down") {
  const r = await callApi(`/api/admin/pages/${pageId}/sections/${sectionId}/move?direction=${direction}`, { method: "POST" });
  if (!r.ok) back(`/admin/pages/${pageId}`, r.error ?? "Không đổi được thứ tự");
  revalidatePath(`/admin/pages/${pageId}`);
}