
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Phần mềm quản lý kho & bán hàng", template: "%s | Aura" },
  description: "Giới thiệu hệ thống quản lý kho, sản xuất, công nợ và lãi lỗ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className="antialiased text-gray-900">{children}</body>
    </html>
  )
}