/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESOURCES } from '@/lib/resources'
import { deleteRecord, saveRecord } from '@/lib/actions'
import { loadRelations } from '@/lib/data'
import RecordForm from '@/components/RecordForm'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Row } from '@/lib/types'

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>
}) {
  const { resource } = await params
  const res = RESOURCES[resource]
  if (!res) notFound()

  const supabase = await createClient()
  const relations = await loadRelations(res)

  // Bảng 1 dòng: hero, contact_info
  if (res.single) {
    const { data } = await supabase.from(resource).select('*').eq('id', 1).maybeSingle()
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{res.title}</h1>
          <p className="text-gray-500 mt-1">Chỉnh sửa rồi bấm Lưu, website sẽ cập nhật ngay.</p>
        </div>
        <RecordForm
          resource={res}
          record={data as Row | null}
          relations={relations}
          action={saveRecord.bind(null, resource, null)}
          submitLabel="Lưu thay đổi"
        />
      </div>
    )
  }

  const { data } = await supabase.from(resource).select('*').order(res.orderBy ?? 'created_at')
  const rows = (data ?? []) as Row[]

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{res.title}</h1>
          <p className="text-gray-500 mt-1">{rows.length} mục</p>
        </div>
      </div>

      <details className="group bg-white border border-gray-100 shadow-sm rounded-2xl">
        <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-semibold text-blue-600">
          <span>＋ Thêm mới</span>
          <span className="text-gray-400 text-sm font-normal group-open:hidden">Bấm để mở form</span>
        </summary>
        <div className="px-6 pb-6">
          <RecordForm
            resource={res}
            relations={relations}
            action={saveRecord.bind(null, resource, null)}
            submitLabel="Thêm"
          />
        </div>
      </details>

      <ul className="space-y-3">
        {rows.map((r) => {
          const id = String(r.id)
          const img = typeof r.image_url === 'string' ? r.image_url : null
          const hidden = r.is_published === false
          return (
            <li
              key={id}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {img ? (
            <img src={img} alt="" className="w-16 h-16 object-cover rounded-xl" />
                ) : res.fields.some((f) => f.type === 'image') ? (
            <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                Không ảnh
            </div>
                ) : null}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {String(r[res.listField ?? 'title'] ?? '(không có tên)')}
                </p>
                <div className="mt-1 flex gap-2">
                  {typeof r.sort_order === 'number' && (
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                      Thứ tự: {r.sort_order}
                    </span>
                  )}
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 ${
                      hidden ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {hidden ? 'Đang ẩn' : 'Đang hiển thị'}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/${resource}/${id}`}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Sửa
              </Link>
              <DeleteButton action={deleteRecord.bind(null, resource, id)} />
            </li>
          )
        })}
        {rows.length === 0 && (
          <div className="text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl py-12">
          Chưa có dữ liệu. Bấm &quot;Thêm mới&quot; để bắt đầu.
          </div>
        )}
      </ul>
    </div>
  )
}