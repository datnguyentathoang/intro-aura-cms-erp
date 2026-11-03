"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi, withError, type ApiResult } from "@/lib/admin-call";
import { rethrowRedirect, uploadImageFile } from "@/lib/upload";

export type PostFormState = { error?: string };

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

// Trả lỗi về form thay vì chuyển trang, để người viết không mất nội dung đang soạn
export async function savePost(id: string | null, _prev: PostFormState, form: FormData): Promise<PostFormState> {
  const body = {
    title: text(form, "title"),
    slug: text(form, "slug"),
    excerpt: text(form, "excerpt") || null,
    content: String(form.get("content") ?? ""),
    thumbnail_url: text(form, "thumbnail_url") || null,
    seo_title: text(form, "seo_title") || null,
    seo_description: text(form, "seo_description") || null,
    author_name: text(form, "author_name") || null,
    category_ids: form.getAll("category_ids").map(String),
  };

  let saved: ApiResult<{ id: string }>;
  try {
    saved = await callApi<{ id: string }>(id ? `/api/admin/posts/${id}` : "/api/admin/posts", {
      method: id ? "PUT" : "POST",
      json: body,
    });
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Không lưu được bài viết" };
  }
  if (!saved.ok || !saved.data) return { error: saved.error ?? "Không lưu được bài viết" };

  const path = `/admin/posts/${saved.data.id}`;
  revalidatePath("/admin/posts");
  if (form.get("intent") !== "publish") redirect(`${path}?saved=1`);

  // Bài đã lưu xong, nếu chưa xuất bản được thì mở trang sửa và báo lỗi: nội dung không bị mất
  const published = await callApi(`/api/admin/posts/${saved.data.id}/publish`, { method: "POST" });
  if (!published.ok) redirect(withError(path, published.error ?? "Không xuất bản được bài viết"));
  redirect(`${path}?published=1`);
}

export async function setPostStatus(id: string, action: "publish" | "unpublish" | "archive", returnTo: string) {
  const r = await callApi(`/api/admin/posts/${id}/${action}`, { method: "POST" });
  if (!r.ok) redirect(withError(returnTo, r.error ?? "Không đổi được trạng thái"));
  revalidatePath("/admin/posts");
  redirect(returnTo);
}

export async function deletePost(id: string, returnTo: string) {
  const r = await callApi(`/api/admin/posts/${id}`, { method: "DELETE" });
  if (!r.ok) redirect(withError(returnTo, r.error ?? "Không xóa được bài viết"));
  revalidatePath("/admin/posts");
  redirect(returnTo);
}

export async function uploadPostImage(form: FormData): Promise<{ url?: string; error?: string }> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Chưa chọn ảnh" };
  try {
    return { url: await uploadImageFile(file, "misc") };
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Tải ảnh thất bại" };
  }
}
