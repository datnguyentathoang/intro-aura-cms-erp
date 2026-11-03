import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminCategory, AdminPost } from "@/lib/admin-types";
import PostArticle from "@/components/PostArticle";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = { title: "Xem trước bài viết", robots: { index: false, follow: false } };

const STATUS_LABEL = { draft: "bản nháp", published: "đã xuất bản", archived: "đã lưu trữ" };

export default async function PostPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    adminJson<AdminPost>(`/api/admin/posts/${id}`),
    adminJson<AdminCategory[]>("/api/admin/categories"),
  ]);
  if (!post) notFound();

  return (
    <SiteShell>
      <PostArticle post={{ ...post, categories: (categories ?? []).filter((c) => post.category_ids.includes(c.id)) }} />
      <div className="fixed bottom-4 left-1/2 z-[60] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2 text-center text-sm text-white shadow-lg">
        Xem trước ({STATUS_LABEL[post.status] ?? post.status}) • bản đã lưu • chỉ quản trị viên thấy •{" "}
        <a href={`/admin/posts/${post.id}`} className="underline">Quay lại chỉnh sửa</a>
      </div>
    </SiteShell>
  );
}
