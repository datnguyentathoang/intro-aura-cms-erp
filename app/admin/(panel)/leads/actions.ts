"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi, withError, type ApiResult } from "@/lib/admin-call";
import { rethrowRedirect } from "@/lib/upload";

export type LeadFormState = { error?: string };

export async function saveLead(id: string, _prev: LeadFormState, form: FormData): Promise<LeadFormState> {
  let saved: ApiResult<unknown>;
  try {
    saved = await callApi(`/api/admin/leads/${id}`, {
      method: "PUT",
      json: { status: String(form.get("status") ?? ""), notes: String(form.get("notes") ?? "") },
    });
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Không lưu được" };
  }
  if (!saved.ok) return { error: saved.error ?? "Không lưu được" };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function deleteLead(id: string) {
  const r = await callApi(`/api/admin/leads/${id}`, { method: "DELETE" });
  if (!r.ok) redirect(withError(`/admin/leads/${id}`, r.error ?? "Không xóa được"));
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect("/admin/leads");
}
