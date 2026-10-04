import { createClient } from '@/lib/supabase/server'
import { deleteMessage, toggleHandled } from '@/lib/actions'
import DeleteButton from '@/components/admin/DeleteButton'

type Msg = {
  id: string
  name: string
  email: string
  message: string
  is_handled: boolean
  created_at: string
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  const messages = (data ?? []) as Msg[]
  const pending = messages.filter((m) => !m.is_handled).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tin nhắn khách gửi</h1>
        <p className="text-gray-500 mt-1">
          {messages.length} tin nhắn, {pending} chưa xử lý
        </p>
      </div>

      {messages.map((m) => (
        <div
          key={m.id}
          className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${
            m.is_handled ? 'border-green-400 opacity-80' : 'border-brand-500'
          }`}
        >
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{m.name}</p>
              <a href={`mailto:${m.email}`} className="text-sm text-brand-600 hover:underline">
                {m.email}
              </a>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(m.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{m.message}</p>
          <div className="mt-4 flex items-center gap-3">
            <form action={toggleHandled.bind(null, m.id, !m.is_handled)}>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  m.is_handled
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}
              >
                {m.is_handled ? '✓ Đã xử lý (bấm để bỏ)' : 'Đánh dấu đã xử lý'}
              </button>
            </form>
            <DeleteButton action={deleteMessage.bind(null, m.id)} message="Xóa tin nhắn này?" />
          </div>
        </div>
      ))}

      {messages.length === 0 && (
        <div className="text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl py-12">
          Chưa có tin nhắn nào.
        </div>
      )}
    </div>
  )
}