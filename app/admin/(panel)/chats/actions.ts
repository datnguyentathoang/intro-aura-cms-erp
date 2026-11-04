"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callApi, withError } from "@/lib/admin-call";

export async function deleteChat(id: string) {
  const r = await callApi(`/api/admin/chats/${id}`, { method: "DELETE" });
  if (!r.ok) redirect(withError(`/admin/chats/${id}`, r.error ?? "Không xóa được"));
  revalidatePath("/admin/chats");
  redirect("/admin/chats");
}
