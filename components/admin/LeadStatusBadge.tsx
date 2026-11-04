import type { AdminLeadStatus } from "@/lib/admin-types";

export const LEAD_STATUSES: { value: AdminLeadStatus; label: string; className: string }[] = [
  { value: "new", label: "Mới", className: "bg-orange-100 text-orange-800" },
  { value: "contacted", label: "Đã liên hệ", className: "bg-sky-100 text-sky-800" },
  { value: "qualified", label: "Tiềm năng cao", className: "bg-violet-100 text-violet-800" },
  { value: "won", label: "Đã chốt", className: "bg-green-100 text-green-800" },
  { value: "lost", label: "Không phù hợp", className: "bg-slate-200 text-slate-800" },
];

export const LEAD_SOURCES: Record<string, string> = {
  contact_form: "Form liên hệ",
  chatbot: "Trợ lý",
};

export default function LeadStatusBadge({ status }: { status: AdminLeadStatus }) {
  const s = LEAD_STATUSES.find((x) => x.value === status) ?? LEAD_STATUSES[0];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}
