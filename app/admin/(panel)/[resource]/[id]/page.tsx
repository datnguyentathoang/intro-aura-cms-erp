import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESOURCES } from '@/lib/resources'
import { saveRecord } from '@/lib/actions'
import { loadRelations } from '@/lib/data'
import RecordForm from '@/components/RecordForm'
import type { Row } from '@/lib/types'

export default async function EditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>
}) {
  const { resource, id } = await params
  const res = RESOURCES[resource]
  if (!res || res.single) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from(resource).select('*').eq('id', id).maybeSingle()
  if (!data) notFound()

  const relations = await loadRelations(res)

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/${resource}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        ← Quay lại danh sách
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sửa: {res.title}</h1>
      </div>
      <RecordForm
        resource={res}
        record={data as Row}
        relations={relations}
        action={saveRecord.bind(null, resource, id)}
        submitLabel="Lưu thay đổi"
      />
    </div>
  )
}