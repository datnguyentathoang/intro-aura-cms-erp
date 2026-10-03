'use client'
import { useFormStatus } from 'react-dom'

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      disabled={pending}
      className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium rounded-lg px-6 py-2.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
    >
      {pending && (
        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {pending ? 'Đang lưu...' : label}
    </button>
  )
}