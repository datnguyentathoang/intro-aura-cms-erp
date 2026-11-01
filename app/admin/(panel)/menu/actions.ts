"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi } from "@/lib/admin-call";

function back(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

function body(form: FormData) {
  const target = String(form.get("target") ?? "none");
  return {
    label: String(form.get("label") ?? "").trim(),
    parent_id: String(form.get("parent_id") ?? "") || null,
    page_id: target === "page" ? String(form.get("page_id") ?? "") || null : null,
    url: target === "url" ? String(form.get("url") ?? "").trim() || null : null,
    is_published: form.get("is_published") === "on",
  };
}

export async function createMenuItem(form: FormData) {
  const r = await callApi("/api/admin/menu", { method: "POST", json: body(form) });
  if (!r.ok) back("/admin/menu/new", r.error ?? "Không tạo được mục menu");
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function updateMenuItem(id: string, form: FormData) {
  const r = await callApi(`/api/admin/menu/${id}`, { method: "PUT", json: body(form) });
  if (!r.ok) back(`/admin/menu/${id}`, r.error ?? "Không lưu được");
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: string) {
  const r = await callApi(`/api/admin/menu/${id}`, { method: "DELETE" });
  if (!r.ok) back("/admin/menu", r.error ?? "Không xóa được");
  revalidatePath("/admin/menu");
}

export async function moveMenuItem(id: string, direction: "up" | "down") {
  const r = await callApi(`/api/admin/menu/${id}/move?direction=${direction}`, { method: "POST" });
  if (!r.ok) back("/admin/menu", r.error ?? "Không đổi được thứ tự");
  revalidatePath("/admin/menu");
}