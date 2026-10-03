import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESOURCES } from '@/lib/resources'
import RecordForm from '@/components/RecordForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { addStep, deleteStep, moveStep } from './actions'

type Step = { id: string; step_order: number; title: string; description: string | null }

const arrowBtn =
  'w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-blue-100 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-700 transition-colors'

export default async function WorkflowStepsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: wf } = await supabase.from('workflows').select('id, title').eq('id', id).maybeSingle()
  if (!wf) notFound()

  const { data } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('workflow_id', id)
    .order('step_order')
    .order('id')
  const steps = (data ?? []) as Step[]
  const nextOrder = steps.length ? Math.max(...steps.map((s) => s.step_order)) + 1 : 1

  // Form thêm bước: ẩn ô "Thuộc luồng" vì đã biết luồng
  const base = RESOURCES.workflow_steps
  const res = { ...base, fields: base.fields.filter((f) => f.name !== 'workflow_id') }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/workflows" className="text-sm font-medium text-blue-600 hover:underline">
        ← Quay lại Luồng nghiệp vụ
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Các bước của luồng</h1>
        <p className="mt-1 font-medium text-gray-700">{wf.title}</p>
        <p className="text-sm text-gray-500">{steps.length} bước</p>
      </div>

      <details className="group bg-white border border-gray-100 shadow-sm rounded-2xl" open={steps.length === 0}>
        <summary className="cursor-pointer list-none px-6 py-4 font-semibold text-blue-600">
          ＋ Thêm bước mới (bước số {nextOrder})
        </summary>
        <div className="px-6 pb-6">
          <RecordForm
            resource={res}
            record={{ step_order: nextOrder }}
            relations={{}}
            action={addStep.bind(null, id)}
            submitLabel="Thêm bước"
          />
        </div>
      </details>

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
          >
            {/* Nút đổi thứ tự */}
            <div className="flex flex-col gap-1">
              <form action={moveStep.bind(null, id, s.id, 'up')}>
                <button className={arrowBtn} disabled={i === 0} title="Chuyển lên">
                  ↑
                </button>
              </form>
              <form action={moveStep.bind(null, id, s.id, 'down')}>
                <button className={arrowBtn} disabled={i === steps.length - 1} title="Chuyển xuống">
                  ↓
                </button>
              </form>
            </div>

            <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center">
              {s.step_order}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{s.title}</p>
              {s.description && <p className="text-sm text-gray-600 mt-1">{s.description}</p>}
            </div>

            <Link
              href={`/admin/workflows/${id}/steps/${s.id}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              Sửa
            </Link>
            <DeleteButton action={deleteStep.bind(null, id, s.id)} />
          </li>
        ))}

        {steps.length === 0 && (
          <div className="text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl py-10">
            Luồng này chưa có bước nào. Bấm &quot;Thêm bước mới&quot; để bắt đầu.
          </div>
        )}
      </ol>
    </div>
  )
}