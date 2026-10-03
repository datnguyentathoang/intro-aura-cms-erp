'use client'

export default function DeleteButton({
  action,
  message = 'Bạn chắc chắn muốn xóa? Hành động này không thể hoàn tác.',
}: {
  action: () => void | Promise<void>
  message?: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault()
      }}
    >
      <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
        Xóa
      </button>
    </form>
  )
}