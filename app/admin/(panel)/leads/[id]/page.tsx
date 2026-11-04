import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import { safeHref } from "@/lib/safe";
import type { AdminChatDetail, AdminLead } from "@/lib/admin-types";
import ChatTranscript from "@/components/admin/ChatTranscript";
import DeleteButton from "@/components/admin/DeleteButton";
import LeadForm from "@/components/admin/LeadForm";
import LeadStatusBadge, { LEAD_SOURCES } from "@/components/admin/LeadStatusBadge";
import { deleteLead } from "../actions";

export default async function LeadDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const lead = await adminJson<AdminLead>(`/api/admin/leads/${id}`);
  if (!lead) notFound();
  const chat = lead.chat_session_id ? await adminJson<AdminChatDetail>(`/api/admin/chats/${lead.chat_session_id}`) : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/leads" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 [overflow-wrap:anywhere]">{lead.name || "(không có tên)"}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <LeadStatusBadge status={lead.status} />
            <span>{LEAD_SOURCES[lead.source] ?? lead.source}</span>
            <span>{new Date(lead.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
          </p>
        </div>
        <DeleteButton action={deleteLead.bind(null, lead.id)} message="Xóa khách hàng này? Không thể hoàn tác." />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800" role="status">Đã lưu thay đổi.</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Số điện thoại</dt>
                <dd className="font-medium text-gray-900">{lead.phone ? <a href={safeHref(`tel:${lead.phone.replace(/[^0-9+]/g, "")}`)} className="text-brand-700 underline">{lead.phone}</a> : "Không có"}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Email</dt>
                <dd className="font-medium text-gray-900 [overflow-wrap:anywhere]">{lead.email ? <a href={safeHref(`mailto:${lead.email}`)} className="text-brand-700 underline">{lead.email}</a> : "Không có"}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Nội dung</dt>
                <dd className="mt-1 text-gray-900 [overflow-wrap:anywhere] whitespace-pre-wrap">{lead.message || "Không có"}</dd>
              </div>
            </dl>
          </section>

          {chat && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Cuộc trò chuyện với trợ lý</h2>
                <Link href={`/admin/chats/${chat.id}`} className="text-sm font-medium text-brand-700 underline">Mở riêng</Link>
              </div>
              <ChatTranscript messages={chat.messages} />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6">
          {/* key theo thời điểm cập nhật: lưu xong form nhận lại dữ liệu mới */}
          <LeadForm key={lead.updated_at ?? "new"} lead={lead} />
        </aside>
      </div>
    </div>
  );
}
