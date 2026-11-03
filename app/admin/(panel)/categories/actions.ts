"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi, type ApiResult } from "@/lib/admin-call";
import { rethrowRedirect } from "@/lib/upload";

export type CategoryFormState = { ok?: boolean; error?: string };

export async function saveCategory(id: string | null, form: FormData): Promise<CategoryFormState> {
  let r: ApiResult<unknown>;
  try {
    r = await callApi(id ? `/api/admin/categories/${id}` : "/api/admin/categories", {
      method: id ? "PUT" : "POST",
      json: {
        name: String(form.get("name") ?? "").trim(),
        slug: String(form.get("slug") ?? "").trim(),
        description: String(form.get("description") ?? "").trim() || null,
      },
    });
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Không lưu được chuyên mục" };
  }
  if (!r.ok) return { error: r.error ?? "Không lưu được chuyên mục" };
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const r = await callApi(`/api/admin/categories/${id}`, { method: "DELETE" });
  if (!r.ok) redirect(`/admin/categories?error=${encodeURIComponent(r.error ?? "Không xóa được chuyên mục")}`);
  revalidatePath("/admin/categories");
}
