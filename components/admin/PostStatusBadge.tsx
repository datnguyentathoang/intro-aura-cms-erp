import type { AdminPostStatus } from "@/lib/admin-types";

const STATUS: Record<AdminPostStatus, { label: string; className: string }> = {
  draft: { label: "Bản nháp", className: "bg-orange-100 text-orange-800" },
  published: { label: "Đã xuất bản", className: "bg-green-100 text-green-800" },
  archived: { label: "Đã lưu trữ", className: "bg-slate-200 text-slate-800" },
};

export default function PostStatusBadge({ status }: { status: AdminPostStatus }) {
  const s = STATUS[status] ?? STATUS.draft;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}
