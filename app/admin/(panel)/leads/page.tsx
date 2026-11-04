import Form from "next/form";
import Link from "next/link";
import { adminJson } from "@/lib/api";
import { parsePage } from "@/lib/blog";
import type { AdminLeadList } from "@/lib/admin-types";
import Pagination from "@/components/Pagination";
import LeadStatusBadge, { LEAD_SOURCES, LEAD_STATUSES } from "@/components/admin/LeadStatusBadge";

const PAGE_SIZE = 20;
const FIELD = "min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500";

type Filters = { q: string; status: string; source: string };

function listHref({ q, status, source }: Filters, page = 1) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (source) params.set("source", source);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin/leads?${search}` : "/admin/leads";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const text = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
  const filters: Filters = {
    q: text(sp.q).slice(0, 100),
    status: LEAD_STATUSES.some((s) => s.value === text(sp.status)) ? text(sp.status) : "",
    source: text(sp.source) in LEAD_SOURCES ? text(sp.source) : "",
  };
  const page = parsePage(sp.page);

  const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);

  const list = await adminJson<AdminLeadList>(`/api/admin/leads?${params}`);
  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.ceil(total / (list?.page_size || PAGE_SIZE));
  const filtered = Boolean(filters.q || filters.status || filters.source);
  const countOf = (status: string) => list?.counts.find((c) => c.status === status)?.count ?? 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khách hàng tiềm năng</h1>
        <p className="mt-1 text-gray-600">Từ form liên hệ và trợ lý trên website. {total} khách{filtered ? " khớp bộ lọc" : ""}.</p>
      </div>

      <nav aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
        <Link
          href={listHref({ ...filters, status: "" })}
          aria-current={filters.status === "" ? "page" : undefined}
          className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${filters.status === "" ? "bg-slate-800 text-white" : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"}`}
        >
          Tất cả
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={listHref({ ...filters, status: s.value })}
            aria-current={filters.status === s.value ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${filters.status === s.value ? "bg-slate-800 text-white" : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"}`}
          >
            {s.label} ({countOf(s.value)})
          </Link>
        ))}
      </nav>

      <Form action="/admin/leads" role="search" className="flex flex-wrap items-center gap-2">
        {filters.status && <input type="hidden" name="status" value={filters.status} />}
        <label htmlFor="lead-q" className="sr-only">Tìm theo tên, email, số điện thoại, nội dung</label>
        <input key={filters.q} id="lead-q" type="search" name="q" defaultValue={filters.q} maxLength={100} placeholder="Tìm tên, email, số điện thoại..." className={`${FIELD} min-w-52 flex-1`} />
        <label htmlFor="lead-source" className="sr-only">Nguồn</label>
        <select key={`s${filters.source}`} id="lead-source" name="source" defaultValue={filters.source} className={FIELD}>
          <option value="">Mọi nguồn</option>
          {Object.entries(LEAD_SOURCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="min-h-11 cursor-pointer rounded-lg bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-900 transition-colors">Lọc</button>
        {filtered && <Link href="/admin/leads" className="rounded px-2 py-3 text-sm font-medium text-brand-700 underline">Xoá lọc</Link>}
      </Form>

      <ul className="space-y-3">
        {items.map((lead) => (
          <li key={lead.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-gray-900 hover:text-brand-700 [overflow-wrap:anywhere]">{lead.name || "(không có tên)"}</Link>
                <p className="text-sm text-gray-600 [overflow-wrap:anywhere]">{[lead.phone, lead.email].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <LeadStatusBadge status={lead.status} />
                <span>{LEAD_SOURCES[lead.source] ?? lead.source}</span>
                <span>{new Date(lead.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
              </div>
            </div>
            {lead.message && <p className="mt-2 line-clamp-2 text-sm text-gray-700 [overflow-wrap:anywhere]">{lead.message}</p>}
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center text-gray-600">
            {filtered ? "Không có khách nào khớp bộ lọc." : page > 1 ? "Trang này không có dữ liệu." : "Chưa có khách hàng tiềm năng nào."}
          </li>
        )}
      </ul>

      {items.length > 0 && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} href={(p) => listHref(filters, p)} />
      )}
    </div>
  );
}
