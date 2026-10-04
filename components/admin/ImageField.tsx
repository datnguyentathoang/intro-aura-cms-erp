'use client'
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'

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
  const shown = preview ?? current

  return (
    <div className="mt-2 flex items-start gap-4">
      <div className="w-32 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center text-xs text-gray-400">
        {shown ? <img src={shown} alt="" className="w-full h-full object-cover" /> : 'Chưa có ảnh'}
      </div>
      <div className="flex-1">
        <input
          name={name}
          type="file"
          accept="image/*"
          required={required && !current}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setPreview(URL.createObjectURL(f))
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 file:cursor-pointer"
        />
        <p className="mt-2 text-xs text-gray-500 font-normal">
          {current ? 'Không chọn file mới thì giữ nguyên ảnh cũ. ' : ''}Tối đa 4MB.
        </p>
      </div>
    </div>
  )
}