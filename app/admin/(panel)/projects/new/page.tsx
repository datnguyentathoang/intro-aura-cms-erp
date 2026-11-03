import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProject() {
  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/projects" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách dự án</Link>
      <h1 className="text-3xl font-bold text-gray-900">Thêm dự án</h1>
      <ProjectForm />
    </div>
  );
}
