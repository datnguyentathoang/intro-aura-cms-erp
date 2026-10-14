import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import { RESOURCES } from "@/lib/resources";
import RecordForm from "@/components/RecordForm";
import type { Row } from "@/lib/types";
import { updateStep } from "../actions";

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;

  const step = await adminJson<Row>(`/api/admin/workflows/${id}/steps/${stepId}`);
  if (!step) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/workflows/${id}/steps`}
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        ← Quay lại danh sách bước
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Sửa bước</h1>
      <RecordForm
        resource={RESOURCES.workflow_steps}
        record={step}
        relations={{}}
        action={updateStep.bind(null, id, stepId)}
        submitLabel="Lưu thay đổi"
      />
    </div>
  );
}