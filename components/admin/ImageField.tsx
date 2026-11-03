'use client'
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react'

const MAX_BYTES = 4 * 1024 * 1024

export default function ImageField({
  name,
  current,
  required,
}: {
  name: string
  current?: string | null
  required?: boolean
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const shown = preview ?? (removed ? null : current)

  return (
    <div className="mt-2 flex items-start gap-4">
      <div className="w-32 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center text-xs text-gray-400">
        {shown ? <img src={shown} alt="" className="w-full h-full object-cover" /> : 'Chưa có ảnh'}
      </div>
      <div className="flex-1 min-w-0">
        <input type="hidden" name={`remove__${name}`} value={removed ? '1' : ''} />
        <input
          ref={fileRef}
          name={name}
          type="file"
          accept="image/*"
          required={required && !current}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            if (f.size > MAX_BYTES) {
              e.target.value = ''
              setError('Ảnh tối đa 4MB.')
              return
            }
            setError('')
            setPreview(URL.createObjectURL(f))
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 file:cursor-pointer"
        />
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-gray-500 font-normal">
          <span>{current && !removed ? 'Không chọn file mới thì giữ nguyên ảnh cũ. ' : ''}Tối đa 4MB.</span>
          {shown && !required && (
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setRemoved(true)
                setError('')
                if (fileRef.current) fileRef.current.value = ''
              }}
              className="cursor-pointer rounded py-1 font-medium text-red-700 hover:underline"
            >
              Bỏ ảnh
            </button>
          )}
        </p>
        {error && <p className="mt-1 text-sm font-normal text-red-700" role="alert">{error}</p>}
      </div>
    </div>
  )
}
