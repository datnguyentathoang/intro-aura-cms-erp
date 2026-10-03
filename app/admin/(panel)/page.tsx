import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminHome() {
  const supabase = await createClient()
  const count = (table: string, filter?: [string, boolean]) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filter) q = q.eq(filter[0], filter[1])
    return q
  }

  const [features, workflows, shots, faqs, unread] = await Promise.all([
    count('features'),
    count('workflows'),
    count('screenshots'),
    count('faqs'),
    count('contact_messages', ['is_handled', false]),
  ])

  const stats = [
    { label: 'Tính năng', value: features.count ?? 0, href: '/admin/features', color: 'from-blue-500 to-blue-600', icon: '⭐' },
    { label: 'Luồng nghiệp vụ', value: workflows.count ?? 0, href: '/admin/workflows', color: 'from-indigo-500 to-indigo-600', icon: '🔀' },
    { label: 'Ảnh chụp màn hình', value: shots.count ?? 0, href: '/admin/screenshots', color: 'from-emerald-500 to-emerald-600', icon: '📸' },
    { label: 'Câu hỏi FAQ', value: faqs.count ?? 0, href: '/admin/faqs', color: 'from-amber-500 to-orange-500', icon: '❓' },
    { label: 'Tin nhắn chưa xử lý', value: unread.count ?? 0, href: '/admin/messages', color: 'from-rose-500 to-red-600', icon: '✉️' },
  ]

  const quick = [
    { label: 'Sửa banner đầu trang', href: '/admin/hero' },
    { label: 'Thêm tính năng mới', href: '/admin/features' },
    { label: 'Thêm bước cho luồng nghiệp vụ', href: '/admin/workflows' },
    { label: 'Cập nhật thông tin liên hệ', href: '/admin/contact_info' },
  ]

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-gray-900">Xin chào 👋</h1>
        <p className="mt-2 text-gray-600">Tổng quan nội dung website giới thiệu.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-fade-up group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all"
            >
              {q.label}
              <span>→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}