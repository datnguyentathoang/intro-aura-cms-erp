import type { Resource } from '@/lib/resources'
import type { Row } from '@/lib/types'
import ImageField from '@/components/admin/ImageField'
import SubmitButton from '@/components/admin/SubmitButton'

type Props = {
  resource: Resource
  record?: Row | null
  relations: Record<string, { id: string; label: string }[]>
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
}

const input =
  'mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

export default function RecordForm({ resource, record, relations, action, submitLabel }: Props) {
  return (
    <form action={action} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5 max-w-2xl">
      {resource.fields.map((f) => {
        const value = record ? record[f.name] : undefined

        if (f.type === 'checkbox') {
          return (
            <label key={f.name} className="flex items-center gap-3 cursor-pointer select-none">
              <input
                name={f.name}
                type="checkbox"
                defaultChecked={record ? Boolean(value) : true}
                className="peer sr-only"
              />
              <span className="relative w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
              <span className="text-sm font-medium text-gray-700">{f.label}</span>
            </label>
          )
        }

        return (
          <label key={f.name} className="block text-sm font-medium text-gray-700">
            {f.label}
            {f.required && <span className="text-red-500 ml-0.5">*</span>}

            {f.type === 'text' && (
              <input name={f.name} defaultValue={String(value ?? '')} required={f.required} className={input} />
            )}
            {f.type === 'textarea' && (
              <textarea name={f.name} rows={4} defaultValue={String(value ?? '')} required={f.required} className={input} />
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
          </label>
        )
      })}

      <div className="pt-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  )
}