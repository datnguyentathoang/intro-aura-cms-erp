import Link from "next/link";
import PageMetaForm from "@/components/admin/PageMetaForm";
import { createPage } from "../actions";

export default async function NewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="space-y-6">
      <Link href="/admin/pages" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách trang</Link>
      <h1 className="text-3xl font-bold text-gray-900">Tạo trang mới</h1>
      {error && <p className="max-w-2xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <PageMetaForm mode="create" action={createPage} submitLabel="Tạo trang" />
      <p className="text-sm text-gray-500">Sau khi tạo, bạn thêm các section ở bước tiếp theo. Trang mới ở trạng thái nháp.</p>
    </div>
  );
}