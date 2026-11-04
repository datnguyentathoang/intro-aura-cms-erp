import Link from "next/link";
import { adminJson } from "@/lib/api";
import { parsePage } from "@/lib/blog";
import type { AdminChatList } from "@/lib/admin-types";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const list = await adminJson<AdminChatList>(`/api/admin/chats?page=${page}&page_size=${PAGE_SIZE}`);
  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.ceil(total / (list?.page_size || PAGE_SIZE));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hội thoại trợ lý</h1>
        <p className="mt-1 text-gray-600">{total} cuộc trò chuyện. Xem khách hay hỏi gì để bổ sung nội dung còn thiếu.</p>
      </div>

      <ul className="space-y-3">
        {items.map((chat) => (
          <li key={chat.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Link href={`/admin/chats/${chat.id}`} className="min-w-0 flex-1 font-semibold text-gray-900 hover:text-brand-700 [overflow-wrap:anywhere]">
                {chat.first_question || "(chưa có câu hỏi)"}
              </Link>
              {chat.lead_id && (
                <Link href={`/admin/leads/${chat.lead_id}`} className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 hover:underline">Đã để lại thông tin</Link>
              )}
            </div>
            <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-600">
              <span>{chat.message_count} câu hỏi</span>
              {chat.page_url && <span className="[overflow-wrap:anywhere]">Từ trang {chat.page_url}</span>}
              <span>Gần nhất {new Date(chat.last_message_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
            </p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
            {page > 1 ? "Trang này không có dữ liệu." : "Chưa có cuộc trò chuyện nào."}
          </li>
        )}
      </ul>

      {items.length > 0 && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} href={(p) => (p > 1 ? `/admin/chats?page=${p}` : "/admin/chats")} />
      )}
    </div>
  );
}
