import Link from "next/link";
import { adminJson } from "@/lib/api";
import type { AdminCategory } from "@/lib/admin-types";
import PostForm from "@/components/admin/PostForm";

export default async function NewPost() {
  const categories = (await adminJson<AdminCategory[]>("/api/admin/categories")) ?? [];
  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/posts" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách bài viết</Link>
      <h1 className="text-3xl font-bold text-gray-900">Viết bài mới</h1>
      <PostForm categories={categories} />
    </div>
  );
}
