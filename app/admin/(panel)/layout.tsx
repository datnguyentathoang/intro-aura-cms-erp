import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RESOURCES } from '@/lib/resources'
import Sidebar, { type NavItem } from '@/components/admin/Sidebar'

const ICONS: Record<string, string> = {
  hero: '🖼️',
  features: '⭐',
  workflows: '🔀',
  workflow_steps: '🪜',
  screenshots: '📸',
  faqs: '❓',
  contact_info: '📞',
}

async function logout() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const items: NavItem[] = [
    { href: '/admin', label: 'Tổng quan', icon: '📊' },
    ...Object.entries(RESOURCES).map(([key, r]) => ({
      href: `/admin/${key}`,
      label: r.title,
      icon: ICONS[key] ?? '📄',
    })),
    { href: '/admin/messages', label: 'Tin nhắn khách gửi', icon: '✉️' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar items={items} email={user?.email ?? ''} logout={logout} />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  )
}