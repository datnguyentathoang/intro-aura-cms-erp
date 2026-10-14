import Link from "next/link";
import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/resources";
import { saveRecord } from "@/lib/actions";
import { adminJson } from "@/lib/api";
import RecordForm from "@/components/RecordForm";
import type { Row } from "@/lib/types";

export default async function EditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  const res = RESOURCES[resource];
  if (!res || !res.api || res.single) notFound();

  const record = await adminJson<Row>(`/api/admin/${res.api}/${id}`);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/${resource}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        ← Quay lại danh sách
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Sửa: {res.title}</h1>
      <RecordForm
        resource={res}
        record={record}
        relations={{}}
        action={saveRecord.bind(null, resource, id)}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}