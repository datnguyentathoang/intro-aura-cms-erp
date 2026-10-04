
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phần mềm quản lý kho & bán hàng',
  description: 'Giới thiệu hệ thống quản lý kho, sản xuất, công nợ và lãi lỗ',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased text-gray-900">{children}</body>
    </html>
  )
}