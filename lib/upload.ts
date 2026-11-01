import { adminFetch, ensureOk } from "@/lib/api";

// redirect() của Next ném một lỗi đặc biệt; không được nuốt nó trong try/catch
export function rethrowRedirect(e: unknown) {
  const d = (e as { digest?: unknown } | null)?.digest;
  if (typeof d === "string" && d.startsWith("NEXT_REDIRECT")) throw e;
}

export async function uploadImageFile(file: File, folder = "misc"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await adminFetch("/api/admin/upload", { method: "POST", form });
  await ensureOk(res);
  return ((await res.json()) as { url: string }).url;
}