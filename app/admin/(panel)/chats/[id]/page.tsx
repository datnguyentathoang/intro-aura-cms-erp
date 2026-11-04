import Link from "next/link";
import { notFound } from "next/navigation";
import { adminJson } from "@/lib/api";
import type { AdminChatDetail } from "@/lib/admin-types";
import ChatTranscript from "@/components/admin/ChatTranscript";
import DeleteButton from "@/components/admin/DeleteButton";
import LeadStatusBadge from "@/components/admin/LeadStatusBadge";
import { deleteChat } from "../actions";

export default async function ChatDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const chat = await adminJson<AdminChatDetail>(`/api/admin/chats/${id}`);
  if (!chat) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/chats" className="text-sm font-medium text-brand-700 hover:underline">← Quay lại danh sách</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Cuộc trò chuyện</h1>
          <p className="mt-2 flex flex-wrap gap-x-3 text-sm text-gray-600">
            <span>{chat.message_count} câu hỏi</span>
            {chat.page_url && <span className="[overflow-wrap:anywhere]">Từ trang {chat.page_url}</span>}
            <span>Bắt đầu {new Date(chat.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
          </p>
        </div>
        <DeleteButton action={deleteChat.bind(null, chat.id)} message="Xóa cuộc trò chuyện này? Khách hàng đã để lại thông tin vẫn được giữ." />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      {chat.lead && (
        <p className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
          Khách đã để lại thông tin:
          <Link href={`/admin/leads/${chat.lead.id}`} className="font-medium text-brand-700 underline [overflow-wrap:anywhere]">{chat.lead.name || "(không có tên)"}</Link>
          <LeadStatusBadge status={chat.lead.status} />
        </p>
      )}

      <ChatTranscript messages={chat.messages} />
    </div>
  );
}
