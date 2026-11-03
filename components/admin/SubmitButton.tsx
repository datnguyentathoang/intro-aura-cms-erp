'use client'
import { useFormStatus } from 'react-dom'

export default function SubmitButton({
  label,
  pendingLabel = 'Đang lưu...',
  block = false,
  pending: pendingProp,
}: {
  label: string
  pendingLabel?: string
  block?: boolean
  pending?: boolean // truyền vào khi form tự gửi trong startTransition, useFormStatus không thấy được
}) {
  const status = useFormStatus()
  const pending = pendingProp ?? status.pending
  return (
    <button
      disabled={pending}
      className={`inline-flex items-center gap-2 bg-brand-700 text-white font-medium rounded-lg px-6 hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all ${
        block ? 'w-full justify-center py-3' : 'py-2.5'
      }`}
    >
      {pending && (
        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
      )}
      {pending ? pendingLabel : label}
    </button>
  )
}
