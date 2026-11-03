import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminCategory, AdminPost } from "@/lib/admin-types";
import DeleteButton from "@/components/admin/DeleteButton";
import PostForm from "@/components/admin/PostForm";
import PostStatusBadge from "@/components/admin/PostStatusBadge";
import { deletePost, setPostStatus } from "../actions";

const ACTION = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const NEUTRAL = `${ACTION} text-gray-700 bg-slate-100 hover:bg-slate-200`;

export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; published?: string }>;
}) {
  const { id } = await params;
  const { error, saved, published } = await searchParams;
  const [post, categories] = await Promise.all([
    adminJson<AdminPost>(`/api/admin/posts/${id}`),
    adminJson<AdminCategory[]>("/api/admin/categories"),
  ]);
  if (!post) notFound();

  const path = `/admin/posts/${post.id}`;
  const isPublished = post.status === "published";

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/posts" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách bài viết</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 [overflow-wrap:anywhere]">{post.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <PostStatusBadge status={post.status} />
            <span>Cập nhật {new Date(post.updated_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
            <span>· {post.read_minutes} phút đọc</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/preview/posts/${post.id}`} target="_blank" rel="noopener" className={NEUTRAL} title="Hiển thị nội dung đã lưu">Xem trước</a>
          {isPublished && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener" className={NEUTRAL}>Xem bài thật</a>
          )}
          {isPublished && (
            <form action={setPostStatus.bind(null, post.id, "unpublish", path)}>
              <button className={`${ACTION} text-orange-800 bg-orange-50 hover:bg-orange-100`}>Về nháp</button>
            </form>
          )}
          {post.status !== "archived" && (
            <form action={setPostStatus.bind(null, post.id, "archive", path)}>
              <button className={NEUTRAL}>Lưu trữ</button>
            </form>
          )}
          <DeleteButton action={deletePost.bind(null, post.id, "/admin/posts")} message="Xóa bài viết này? Không thể hoàn tác." />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="status">Đã lưu thay đổi.</p>}
      {published && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="status">Đã lưu và xuất bản bài viết.</p>}

      {/* key theo thời điểm cập nhật: sau mỗi lần lưu, form nhận lại dữ liệu mới từ API */}
      <PostForm key={post.updated_at} post={post} categories={categories ?? []} />
    </div>
  );
}
