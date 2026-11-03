import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminProject } from "@/lib/admin-types";
import ProjectArticle from "@/components/ProjectArticle";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = { title: "Xem trước dự án", robots: { index: false, follow: false } };

const STATUS_LABEL = { draft: "bản nháp", published: "đã xuất bản" };

export default async function ProjectPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await adminJson<AdminProject>(`/api/admin/projects/${id}`);
  if (!project) notFound();

  return (
    <SiteShell>
      <ProjectArticle project={project} />
      <div className="fixed bottom-4 left-1/2 z-[60] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2 text-center text-sm text-white shadow-lg">
        Xem trước ({STATUS_LABEL[project.status] ?? project.status}) • bản đã lưu • chỉ quản trị viên thấy •{" "}
        <a href={`/admin/projects/${project.id}`} className="underline">Quay lại chỉnh sửa</a>
      </div>
    </SiteShell>
  );
}
