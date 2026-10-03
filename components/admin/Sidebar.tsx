'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export type NavItem = { href: string; label: string; icon: string }

export default function Sidebar({
  items,
  email,
  logout,
}: {
  items: NavItem[]
  email: string
  logout: () => void | Promise<void>
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {/* Thanh trên cho mobile */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-slate-900 text-white flex items-center justify-between px-4">
        <span className="font-bold">Aura CMS</span>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-slate-800" aria-label="Mở menu">
          <div className="w-5 space-y-1.5">
            <span className="block h-0.5 bg-white" />
            <span className="block h-0.5 bg-white" />
            <span className="block h-0.5 bg-white" />
          </div>
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
            A
          </span>
          <div className="leading-tight">
            <p className="font-bold text-white">Aura CMS</p>
            <p className="text-xs text-slate-500">Quản trị nội dung</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(it.href)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{it.icon}</span>
              {it.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-300 hover:bg-slate-800 transition-colors"
          >
            <span className="text-base w-5 text-center">🌐</span>
            Xem website ↗
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 truncate" title={email}>{email}</p>
          <form action={logout}>
            <button className="mt-2 w-full rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-sm py-2 transition-colors">
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}