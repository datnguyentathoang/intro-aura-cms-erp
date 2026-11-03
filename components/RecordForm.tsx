'use client'
import { startTransition, useActionState } from 'react'
import type { RecordFormState } from '@/lib/actions'
import type { Resource } from '@/lib/resources'
import type { Row } from '@/lib/types'
import ImageField from '@/components/admin/ImageField'
import SubmitButton from '@/components/admin/SubmitButton'

type Props = {
  resource: Resource
  record?: Row | null
  relations: Record<string, { id: string; label: string }[]>
  action: (prev: RecordFormState, formData: FormData) => Promise<RecordFormState>
  submitLabel: string
}

const input =
  'mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition'

export default function RecordForm({ resource, record, relations, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form
      action={formAction}
      // Tự gửi trong startTransition: với <form action>, React xoá trắng form sau mỗi lần gửi, kể cả khi lưu lỗi
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        startTransition(() => formAction(form))
      }}
      className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5 max-w-2xl"
    >
      {resource.fields.map((f) => {
        const value = record ? record[f.name] : undefined

        if (f.type === 'checkbox') {
          return (
            <label key={f.name} className="flex items-center gap-3 cursor-pointer select-none">
              <input
                name={f.name}
                type="checkbox"
                defaultChecked={record ? Boolean(value) : !f.defaultOff}
                className="peer sr-only"
              />
              <span className="relative w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-brand-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
              <span className="text-sm font-medium text-gray-700">{f.label}</span>
            </label>
          )
        }

        return (
          <label key={f.name} className="block text-sm font-medium text-gray-700">
            {f.label}
            {f.required && <span className="text-red-500 ml-0.5">*</span>}

            {f.type === 'text' && (
              <input name={f.name} defaultValue={String(value ?? '')} required={f.required} maxLength={f.maxLength} className={input} />
            )}
            {f.type === 'textarea' && (
              <textarea name={f.name} rows={4} defaultValue={String(value ?? '')} required={f.required} maxLength={f.maxLength} className={input} />
            )}
            {f.type === 'lines' && (
              <textarea name={f.name} rows={6} defaultValue={Array.isArray(value) ? value.join('\n') : ''} className={input} />
            )}
            {f.type === 'number' && (
              <input name={f.name} type="number" defaultValue={Number(value ?? 0)} className={input} />
            )}
            {f.type === 'relation' && (
              <select name={f.name} defaultValue={String(value ?? '')} required={f.required} className={input}>
                <option value="">-- Chọn --</option>
                {(relations[f.name] ?? []).map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            )}
            {f.type === 'image' && (
              <ImageField
                name={f.name}
                current={typeof value === 'string' ? value : null}
                required={f.required}
              />
            )}
            {f.help && <span className="mt-1 block text-xs font-normal text-gray-600">{f.help}</span>}
          </label>
        )
      })}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 [overflow-wrap:anywhere]" role="alert">{state.error}</p>
      )}

      <div className="pt-2">
        <SubmitButton label={submitLabel} pending={pending} />
      </div>
    </form>
  )
}
