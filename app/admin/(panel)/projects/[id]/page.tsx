import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminProject } from "@/lib/admin-types";
import DeleteButton from "@/components/admin/DeleteButton";
import PostStatusBadge from "@/components/admin/PostStatusBadge";
import ProjectForm from "@/components/admin/ProjectForm";
import { deleteProject, setProjectStatus } from "../actions";

const ACTION = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const NEUTRAL = `${ACTION} text-gray-700 bg-slate-100 hover:bg-slate-200`;

export default async function EditProject({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; published?: string }>;
}) {
  const { id } = await params;
  const { error, saved, published } = await searchParams;
  const project = await adminJson<AdminProject>(`/api/admin/projects/${id}`);
  if (!project) notFound();

  const path = `/admin/projects/${project.id}`;
  const isPublished = project.status === "published";

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/projects" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách dự án</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 [overflow-wrap:anywhere]">{project.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <PostStatusBadge status={project.status} />
            <span>Cập nhật {new Date(project.updated_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/preview/projects/${project.id}`} target="_blank" rel="noopener" className={NEUTRAL} title="Hiển thị nội dung đã lưu">Xem trước</a>
          {isPublished && (
            <>
              <a href={`/portfolio/${project.slug}`} target="_blank" rel="noopener" className={NEUTRAL}>Xem trang thật</a>
              <form action={setProjectStatus.bind(null, project.id, "unpublish", path)}>
                <button className={`${ACTION} text-orange-800 bg-orange-50 hover:bg-orange-100`}>Về nháp</button>
              </form>
            </>
          )}
          <DeleteButton action={deleteProject.bind(null, project.id)} message="Xóa dự án này cùng thư viện ảnh? Không thể hoàn tác." />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="status">Đã lưu thay đổi.</p>}
      {published && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="status">Đã lưu và xuất bản dự án.</p>}

      {/* key theo thời điểm cập nhật: sau mỗi lần lưu, form nhận lại dữ liệu mới từ API */}
      <ProjectForm key={project.updated_at} project={project} />
    </div>
  );
}
