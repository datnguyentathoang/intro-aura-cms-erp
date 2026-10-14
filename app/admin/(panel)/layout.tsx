import { redirect } from "next/navigation";
import { RESOURCES } from "@/lib/resources";
import { getEmail, signOut } from "@/lib/session";
import { getBrand } from "@/lib/api";
import Sidebar, { type NavItem } from "@/components/admin/Sidebar";

const ICONS: Record<string, string> = {
  hero: "🖼️",
  features: "⭐",
  workflows: "🔀",
  screenshots: "📸",
  faqs: "❓",
  contact_info: "📞",
};

async function logout() {
  "use server";
  await signOut();
  redirect("/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = await getEmail();
  const { logoUrl, brandName } = await getBrand();

  const items: NavItem[] = [
    { href: "/admin", label: "Tổng quan", icon: "📊" },
    ...Object.entries(RESOURCES)
      .filter(([key]) => key !== "workflow_steps")
      .map(([key, r]) => ({
        href: `/admin/${key}`,
        label: r.title,
        icon: ICONS[key] ?? "📄",
      })),
    { href: "/admin/messages", label: "Tin nhắn khách gửi", icon: "✉️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        items={items}
        email={email}
        logout={logout}
        logoUrl={logoUrl}
        brand={brandName}
      />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}