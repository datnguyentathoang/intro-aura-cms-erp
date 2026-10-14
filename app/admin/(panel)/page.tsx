import Link from "next/link";
import { adminJson } from "@/lib/api";

type Stats = {
  features: number;
  workflows: number;
  screenshots: number;
  faqs: number;
  unread_messages: number;
};

export default async function AdminHome() {
  const s = (await adminJson<Stats>("/api/admin/stats")) ?? {
    features: 0,
    workflows: 0,
    screenshots: 0,
    faqs: 0,
    unread_messages: 0,
  };

  const stats = [
    { label: "Tính năng", value: s.features, href: "/admin/features", color: "from-brand-500 to-brand-600", icon: "⭐" },
    { label: "Luồng nghiệp vụ", value: s.workflows, href: "/admin/workflows", color: "from-sky-500 to-sky-600", icon: "🔀" },
    { label: "Ảnh chụp màn hình", value: s.screenshots, href: "/admin/screenshots", color: "from-emerald-500 to-emerald-600", icon: "📸" },
    { label: "Câu hỏi FAQ", value: s.faqs, href: "/admin/faqs", color: "from-violet-500 to-violet-600", icon: "❓" },
    { label: "Tin nhắn chưa xử lý", value: s.unread_messages, href: "/admin/messages", color: "from-rose-500 to-red-600", icon: "✉️" },
  ];

  const quick = [
    { label: "Sửa banner đầu trang", href: "/admin/hero" },
    { label: "Thêm tính năng mới", href: "/admin/features" },
    { label: "Quản lý các bước của luồng", href: "/admin/workflows" },
    { label: "Cập nhật thông tin liên hệ", href: "/admin/contact_info" },
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold text-gray-900">Xin chào 👋</h1>
        <p className="mt-2 text-gray-600">Tổng quan nội dung website giới thiệu.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((x, i) => (
          <Link
            key={x.label}
            href={x.href}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-fade-up group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${x.color} text-white flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
              {x.icon}
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{x.value}</p>
            <p className="text-sm text-gray-500">{x.label}</p>
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
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 hover:shadow-md transition-all"
            >
              {q.label}
              <span>→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}