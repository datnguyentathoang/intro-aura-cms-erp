"use client";
import { useState, useTransition } from "react";
import { testAssistant, type AssistantTestResult } from "@/app/admin/(panel)/ai_settings/actions";
import { safeHref } from "@/lib/safe";

// Thử hỏi trợ lý ngay trong admin, kể cả khi chưa bật cho khách. Câu hỏi thử không được lưu
export default function AssistantTester() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AssistantTestResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => setResult(await testAssistant(question)));
      }}
    >
      <label className="block text-sm font-medium text-gray-700">
        Câu hỏi thử
        <input
          value={question}
          required
          maxLength={500}
          placeholder="Ví dụ: Phần mềm có quản lý được nhiều kho không?"
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>
      <button disabled={pending} className="min-h-11 cursor-pointer rounded-lg bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 transition-colors">
        {pending ? "Đang hỏi..." : "Hỏi thử"}
      </button>
      <div aria-live="polite">
        {result?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{result.error}</p>}
        {result?.reply && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-gray-900">
            <p className="[overflow-wrap:anywhere] whitespace-pre-wrap">{result.reply}</p>
            {(result.sources ?? []).length > 0 ? (
              <ul className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs">
                {(result.sources ?? []).map((s) => (
                  <li key={`${s.title}-${s.url}`}>
                    <a href={safeHref(s.url)} target="_blank" rel="noopener" className="font-medium text-brand-700 underline">{s.title}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-600">Không dùng nguồn nào từ website.</p>
            )}
            {result.suggest_lead && <p className="mt-2 text-xs text-gray-600">Khách sẽ thấy nút để lại thông tin.</p>}
          </div>
        )}
      </div>
    </form>
  );
}
