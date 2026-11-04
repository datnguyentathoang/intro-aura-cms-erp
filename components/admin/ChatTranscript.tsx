import { safeHref } from "@/lib/safe";
import type { AdminChatMessage } from "@/lib/admin-types";

// Nội dung do khách và AI tạo ra chỉ hiển thị dạng văn bản, không bao giờ dựng thành HTML
export default function ChatTranscript({ messages }: { messages: AdminChatMessage[] }) {
  if (messages.length === 0) return <p className="text-sm text-gray-600">Cuộc trò chuyện chưa có tin nhắn.</p>;
  return (
    <ol className="space-y-3">
      {messages.map((m) => {
        const isUser = m.role === "user";
        const sources = Array.isArray(m.sources) ? m.sources : [];
        return (
          <li key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm [overflow-wrap:anywhere] whitespace-pre-wrap ${isUser ? "bg-brand-700 text-white" : "border border-gray-200 bg-white text-gray-900"}`}>
              {m.content}
              {sources.length > 0 && (
                <ul className="mt-2 space-y-0.5 border-t border-gray-200 pt-2 text-xs">
                  {sources.map((s) => (
                    <li key={`${s.title}-${s.url}`}>
                      <a href={safeHref(s.url)} target="_blank" rel="noopener" className="font-medium text-brand-700 underline">{s.title}</a>
                    </li>
                  ))}
                </ul>
              )}
              <p className={`mt-1 text-xs ${isUser ? "text-white/85" : "text-gray-600"}`}>
                {new Date(m.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                {!isUser && m.provider && ` · ${m.provider}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
