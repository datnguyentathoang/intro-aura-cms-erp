import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminPage } from "@/lib/admin-types";
import { SCHEMAS } from "@/lib/section-schemas";
import SectionForm from "@/components/admin/SectionForm";
import { saveSection } from "../../../actions";

export default async function EditSection({
  params, searchParams,
}: {
  params: Promise<{ id: string; sectionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, sectionId } = await params;
  const { error } = await searchParams;

  const page = await adminJson<AdminPage>(`/api/admin/pages/${id}`);
  const section = page?.sections?.find((s) => s.id === sectionId);
  if (!page || !section) notFound();

  const schema = SCHEMAS[section.type];
  const content = section.content ?? {};
  const isNew = Object.keys(content).length === 0;

  return (
    <div className="space-y-6">
      <Link href={`/admin/pages/${id}`} className="text-sm font-medium text-brand-600 hover:underline">
        ← Quay lại trang: {page.title}
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{schema ? schema.label : section.type}</h1>
        {schema && <p className="mt-1 text-gray-500">{schema.description}</p>}
      </div>
      {error && <p className="max-w-3xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {schema ? (
        <SectionForm
          schema={schema}
          content={content}
          isPublished={isNew ? true : section.is_published}
          action={saveSection.bind(null, id, sectionId, section.type)}
          cancelHref={`/admin/pages/${id}`}
        />
      ) : (
        <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-700">Loại section &quot;{section.type}&quot; chưa có biểu mẫu chỉnh sửa.</p>
      )}
    </div>
  );
}