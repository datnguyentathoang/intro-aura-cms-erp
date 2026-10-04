import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESOURCES } from '@/lib/resources'
import RecordForm from '@/components/RecordForm'
import type { Row } from '@/lib/types'
import { updateStep } from '../actions'

export default async function EditStepPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>
}) {
  const { id, stepId } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('id', stepId)
    .eq('workflow_id', id)
    .maybeSingle()
  if (!data) notFound()

  const base = RESOURCES.workflow_steps
  const res = { ...base, fields: base.fields.filter((f) => f.name !== 'workflow_id') }

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
        resource={res}
        record={data as Row}
        relations={{}}
        action={updateStep.bind(null, id, stepId)}
        submitLabel="Lưu thay đổi"
      />
    </div>
  )
}