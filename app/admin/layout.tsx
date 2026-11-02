import type { Metadata } from "next";

// Toàn bộ khu quản trị không cho công cụ tìm kiếm lập chỉ mục
export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị Aura" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
