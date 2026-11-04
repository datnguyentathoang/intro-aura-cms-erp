"use server";
import { cookies, headers } from "next/headers";

// Trình duyệt không gọi thẳng API. Token phiên chat nằm trong cookie httpOnly, chỉ server Next.js đọc được
const COOKIE = "aura_chat";
const WEEK = 60 * 60 * 24 * 7;
const MAX_MESSAGE = 500;

export type ChatSourceView = { title: string; url: string | null };
export type ChatBubble = { role: "user" | "assistant"; content: string; sources: ChatSourceView[] };
export type ChatSendResult =
  | { ok: true; reply: string; sources: ChatSourceView[]; suggestLead: boolean }
  | { ok: false; error: "rate" | "invalid" | "unavailable"; message?: string };
export type ChatLeadInput = { name: string; phone: string; email: string; note: string };
export type ChatLeadResult = { ok: true } | { ok: false; message: string };

async function chatFetch(path: string, json?: unknown) {
  const base = process.env.API_BASE_URL;
  if (!base) throw new Error("Thiếu biến môi trường API_BASE_URL");

  const out: Record<string, string> = {};
  if (json !== undefined) out["Content-Type"] = "application/json";
  const session = (await cookies()).get(COOKIE)?.value;
  if (session) out["X-Chat-Session"] = session;

  // Cho API biết IP của khách để giới hạn theo từng người; khoá riêng chứng minh header này do Next.js gửi
  const key = process.env.CHAT_PROXY_KEY;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  if (key && ip) {
    out["X-Chat-Proxy-Key"] = key;
    out["X-Visitor-Ip"] = ip;
  }

  return fetch(`${base.replace(/\/$/, "")}/api/public/chat/${path}`, {
    method: json === undefined ? "GET" : "POST",
    headers: out,
    body: json === undefined ? undefined : JSON.stringify(json),
    cache: "no-store",
    // API trên gói miễn phí có thể đang ngủ, cần thời gian thức dậy
    signal: AbortSignal.timeout(55000),
  });
}

async function errorOf(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === "string") return body.error;
  } catch {}
  return fallback;
}

// Không ném lỗi ra ngoài: ở production Next ẩn nội dung lỗi của Server Action
export async function sendChatMessage(message: string, pageUrl: string): Promise<ChatSendResult> {
  const text = typeof message === "string" ? message.trim() : "";
  if (!text || text.length > MAX_MESSAGE) return { ok: false, error: "invalid", message: `Câu hỏi từ 1 đến ${MAX_MESSAGE} ký tự.` };

  try {
    const res = await chatFetch("messages", { message: text, page_url: String(pageUrl ?? "").slice(0, 300) || null });
    if (res.status === 429) return { ok: false, error: "rate" };
    if (res.status === 400) return { ok: false, error: "invalid", message: await errorOf(res, "Câu hỏi chưa hợp lệ.") };
    if (!res.ok) return { ok: false, error: "unavailable" };

    const data = (await res.json()) as { session_token?: string | null; reply: string; sources?: ChatSourceView[]; suggest_lead?: boolean };
    if (data.session_token) {
      (await cookies()).set(COOKIE, data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: WEEK,
      });
    }
    return { ok: true, reply: data.reply, sources: data.sources ?? [], suggestLead: data.suggest_lead === true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

export async function loadChatHistory(): Promise<{ messages: ChatBubble[]; leadCaptured: boolean }> {
  if (!(await cookies()).get(COOKIE)) return { messages: [], leadCaptured: false };
  try {
    const res = await chatFetch("messages");
    if (!res.ok) return { messages: [], leadCaptured: false };
    const data = (await res.json()) as { messages?: ChatBubble[]; lead_captured?: boolean };
    const messages = (data.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
      sources: Array.isArray(m.sources) ? m.sources : [],
    }));
    return { messages, leadCaptured: data.lead_captured === true };
  } catch {
    return { messages: [], leadCaptured: false };
  }
}

export async function submitChatLead(input: ChatLeadInput): Promise<ChatLeadResult> {
  const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  try {
    const res = await chatFetch("lead", {
      name: clean(input?.name, 100),
      phone: clean(input?.phone, 20) || null,
      email: clean(input?.email, 200) || null,
      message: clean(input?.note, 1000) || null,
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, message: "Bạn gửi hơi nhanh. Đợi khoảng một phút rồi thử lại nhé." };
    if (res.status === 400) return { ok: false, message: await errorOf(res, "Thông tin chưa hợp lệ, bạn kiểm tra lại giúp mình nhé.") };
    return { ok: false, message: "Chưa gửi được thông tin. Bạn thử lại hoặc dùng form liên hệ nhé." };
  } catch {
    return { ok: false, message: "Chưa gửi được thông tin. Bạn thử lại hoặc dùng form liên hệ nhé." };
  }
}

export async function resetChat() {
  (await cookies()).delete(COOKIE);
}
