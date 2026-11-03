import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminJson, withSharedLists } from "@/lib/api";
import type { AdminPage } from "@/lib/admin-types";
import SiteShell from "@/components/SiteShell";
import SectionRenderer from "@/components/SectionRenderer";

export const metadata: Metadata = { title: "Xem trước", robots: { index: false, follow: false } };

export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await adminJson<AdminPage>(`/api/admin/pages/${id}`);
  if (!page) notFound();

  const sections = await withSharedLists(
    (page.sections ?? [])
      .filter((s) => s.is_published)
      .map((s) => ({ id: s.id, type: s.type, content: s.content ?? {} }))
  );

  return (
    <SiteShell darkTop={sections[0]?.type === "hero"}>
      {sections.length > 0 ? (
        <SectionRenderer sections={sections} pageTitle={page.title} />
      ) : (
        <section className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          <p className="mt-4 text-gray-500">Trang chưa có section nào đang hiển thị.</p>
        </section>
      )}
      <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2 text-sm text-white shadow-lg">
        Xem trước ({page.status === "published" ? "đã xuất bản" : "bản nháp"}) • chỉ quản trị viên thấy •{" "}
        <a href={`/admin/pages/${page.id}`} className="underline">Quay lại chỉnh sửa</a>
      </div>
    </SiteShell>
  );
}