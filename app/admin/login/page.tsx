import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function login(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  })
  if (error) redirect('/admin/login?error=1')
  redirect('/admin')
}

const input =
  'w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-4 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob [animation-delay:3s]" />

      <form
        action={login}
        className="animate-fade-up relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5"
      >
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/30">
            A
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Đăng nhập quản trị</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nội dung website giới thiệu</p>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">Sai email hoặc mật khẩu.</p>
        )}

        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Mật khẩu" required className={input} />

        <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all">
          Đăng nhập
        </button>
      </form>
    </main>
  )
}