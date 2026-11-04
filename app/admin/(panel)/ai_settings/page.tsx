import Link from "next/link";
import { saveRecord } from "@/lib/actions";
import { adminJson } from "@/lib/api";
import type { AiStatus } from "@/lib/admin-types";
import { RESOURCES } from "@/lib/resources";
import type { Row } from "@/lib/types";
import RecordForm from "@/components/RecordForm";
import AssistantTester from "@/components/admin/AssistantTester";

const CARD = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";
const KIND_LABEL: Record<string, string> = {
  about: "Giới thiệu",
  contact: "Liên hệ",
  faq: "Câu hỏi thường gặp",
  feature: "Tính năng",
  manual: "Kiến thức bổ sung",
  page: "Trang",
  post: "Bài viết",
  pricing: "Gói giá",
  project: "Dự án",
  team: "Đội ngũ",
};

export default async function AiSettingsPage() {
  const [settings, status] = await Promise.all([
    adminJson<Row>("/api/admin/ai/settings"),
    adminJson<AiStatus>("/api/admin/ai/status"),
  ]);
  const isMock = status?.provider === "mock";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trợ lý AI</h1>
        <p className="mt-1 text-gray-600">Trợ lý chỉ trả lời từ nội dung đã xuất bản. Không có thông tin thì mời khách để lại liên hệ.</p>
      </div>

      {status && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={CARD}>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <p className={`mt-1 text-xl font-bold ${status.is_enabled ? "text-green-800" : "text-gray-900"}`}>{status.is_enabled ? "Đang bật" : "Đang tắt"}</p>
          </div>
          <div className={CARD}>
            <p className="text-sm text-gray-600">Câu trả lời hôm nay</p>
            <p className="mt-1 text-xl font-bold text-gray-900 tabular-nums">{status.used_today}/{status.daily_limit}</p>
          </div>
          <div className={CARD}>
            <p className="text-sm text-gray-600">Bộ trả lời</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{isMock ? "Mock" : status.provider}</p>
          </div>
        </div>
      )}

      {isMock && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Đang dùng Mock: không gọi dịch vụ AI nào và không tốn phí, câu trả lời là các câu trích nguyên văn từ nội dung website.
          Muốn dùng AI thật, đặt <code>Ai__Provider</code>, <code>Ai__ApiKey</code> và <code>Ai__Model</code> trên máy chủ API.
        </p>
      )}

      <section className={`${CARD} space-y-3`}>
        <h2 className="text-lg font-semibold text-gray-900">Trợ lý đang biết gì</h2>
        {status ? (
          <>
            <ul className="flex flex-wrap gap-2 text-sm text-gray-800">
              {status.sources.map((s) => (
                <li key={s.kind} className="rounded-full bg-slate-100 px-3 py-1">{KIND_LABEL[s.kind] ?? s.kind}: {s.count}</li>
              ))}
              {status.sources.length === 0 && <li className="text-gray-600">Chưa có nội dung nào đã xuất bản.</li>}
            </ul>
            <p className="text-sm text-gray-600">
              Nội dung mới xuất bản hoặc vừa gỡ có hiệu lực sau khoảng 1 phút.{" "}
              <Link href="/admin/knowledge_documents" className="font-medium text-brand-700 underline">Thêm kiến thức bổ sung</Link>
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">Chưa đọc được trạng thái. Kiểm tra đã chạy file SQL 006 và deploy API chưa.</p>
        )}
      </section>

      <section className={CARD}>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Hỏi thử</h2>
        <AssistantTester />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Cài đặt</h2>
        {/* key theo dữ liệu: lưu xong form nhận lại giá trị mới */}
        <RecordForm
          key={JSON.stringify(settings)}
          resource={RESOURCES.ai_settings}
          record={settings}
          relations={{}}
          action={saveRecord.bind(null, "ai_settings", null)}
          submitLabel="Lưu cài đặt"
        />
      </section>
    </div>
  );
}
