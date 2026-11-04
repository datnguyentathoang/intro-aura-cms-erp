"use client";
import { startTransition, useActionState } from "react";
import { saveLead, type LeadFormState } from "@/app/admin/(panel)/leads/actions";
import type { AdminLead } from "@/lib/admin-types";
import { LEAD_STATUSES } from "@/components/admin/LeadStatusBadge";
import SubmitButton from "@/components/admin/SubmitButton";

const FIELD = "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function LeadForm({ lead }: { lead: AdminLead }) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(saveLead.bind(null, lead.id), {});

  return (
    <form
      action={action}
      // Tự gửi trong startTransition: với <form action>, React xoá trắng form sau mỗi lần gửi, kể cả khi lưu lỗi
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        startTransition(() => action(form));
      }}
      className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <label className="block text-sm font-medium text-gray-700">
        Trạng thái
        <select name="status" defaultValue={lead.status} className={FIELD}>
          {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Ghi chú nội bộ
        <textarea name="notes" rows={5} maxLength={4000} defaultValue={lead.notes ?? ""} className={FIELD} />
        <span className="mt-1 block text-xs font-normal text-gray-600">Chỉ quản trị viên thấy, ví dụ: đã gọi lúc nào, khách cần gì.</span>
      </label>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}
      <SubmitButton label="Lưu" pending={pending} />
    </form>
  );
}
