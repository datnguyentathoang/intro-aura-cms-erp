"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  loadChatHistory,
  resetChat,
  sendChatMessage,
  submitChatLead,
  type ChatBubble,
  type ChatSourceView,
} from "@/lib/chat-actions";
import { safeHref } from "@/lib/safe";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const FIELD = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500";
const MAX_MESSAGE = 500;
const STARTERS = ["Aura ERP có những tính năng gì?", "Bảng giá thế nào?", "Làm sao để liên hệ tư vấn?"];

type Bubble = ChatBubble & { key: number };

function Sources({ items, onNavigate }: { items: ChatSourceView[]; onNavigate: () => void }) {
  const links = items.flatMap((item) => {
    const href = safeHref(item.url);
    return href === "#" ? [] : [{ title: item.title, href }];
  });
  if (links.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 border-t border-gray-200 pt-2 text-xs">
      {links.map((link) => (
        <li key={`${link.href}-${link.title}`}>
          {link.href.startsWith("/") ? (
            <Link href={link.href} onClick={onNavigate} className={`rounded font-medium text-brand-700 underline ${FOCUS_RING}`}>{link.title}</Link>
          ) : (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={`rounded font-medium text-brand-700 underline ${FOCUS_RING}`}>{link.title}</a>
          )}
        </li>
      ))}
    </ul>
  );
}

function LeadForm({ onDone, onCancel }: { onDone: (name: string) => void; onCancel: () => void }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    firstField.current?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <form
      aria-label="Để lại thông tin liên hệ"
      className="rounded-xl border border-gray-200 bg-white p-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const input = {
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          email: String(form.get("email") ?? ""),
          note: String(form.get("note") ?? ""),
        };
        if (!input.phone.trim() && !input.email.trim()) {
          setError("Bạn để lại số điện thoại hoặc email để đội ngũ liên hệ nhé.");
          return;
        }
        setError("");
        startTransition(async () => {
          const result = await submitChatLead(input);
          if (result.ok) onDone(input.name.trim());
          else setError(result.message);
        });
      }}
    >
      <p className="font-semibold text-gray-900">Để lại thông tin để được tư vấn</p>
      <label className="mt-2 block font-medium text-gray-700">
        Họ tên<span className="ml-0.5 text-red-700">*</span>
        <input ref={firstField} name="name" required maxLength={100} autoComplete="name" className={FIELD} />
      </label>
      <label className="mt-2 block font-medium text-gray-700">
        Số điện thoại
        <input name="phone" type="tel" maxLength={20} autoComplete="tel" className={FIELD} />
      </label>
      <label className="mt-2 block font-medium text-gray-700">
        Email
        <input name="email" type="email" maxLength={200} autoComplete="email" className={FIELD} />
      </label>
      <label className="mt-2 block font-medium text-gray-700">
        Nội dung cần tư vấn
        <textarea name="note" rows={2} maxLength={1000} className={FIELD} />
      </label>
      <p className="mt-2 text-xs text-gray-600">Thông tin chỉ dùng để đội ngũ Aura liên hệ tư vấn cho bạn.</p>
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={pending} className={`min-h-11 cursor-pointer rounded-lg bg-brand-700 px-4 font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}>
          {pending ? "Đang gửi..." : "Gửi thông tin"}
        </button>
        <button type="button" onClick={onCancel} className={`min-h-11 cursor-pointer rounded-lg border border-gray-300 px-4 font-medium text-gray-800 hover:bg-gray-50 ${FOCUS_RING}`}>
          Để sau
        </button>
      </div>
    </form>
  );
}

export default function ChatWidget({ botName, welcome }: { botName: string; welcome: string }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [problem, setProblem] = useState<"" | "rate" | "unavailable" | "invalid">("");
  const [problemText, setProblemText] = useState("");
  const [suggestLead, setSuggestLead] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadDone, setLeadDone] = useState(false);

  const nextKey = useRef(1);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const bubble = (b: ChatBubble): Bubble => ({ ...b, key: nextKey.current++ });

  // Lần mở đầu tiên: khôi phục cuộc trò chuyện đang dở
  useEffect(() => {
    if (!open || loaded) return;
    let stale = false;
    loadChatHistory().then((history) => {
      if (stale) return;
      setMessages((cur) => (cur.length > 0 ? cur : history.messages.map(bubble)));
      setLeadDone(history.leadCaptured);
      setLoaded(true);
    });
    return () => { stale = true; };
  }, [open, loaded]);

  // Mở thì đưa con trỏ vào ô nhập, đóng thì trả focus về nút mở
  useEffect(() => {
    if (open) input.current?.focus();
    else if (wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Trên điện thoại khung chat chiếm cả màn hình nên khoá cuộn trang phía sau
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 639px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, pending, suggestLead, problem]);

  if (pathname.startsWith("/admin")) return null;

  function send(value: string) {
    const question = value.trim();
    if (!question || pending) return;
    setProblem("");
    setProblemText("");
    setText("");
    setMessages((cur) => [...cur, bubble({ role: "user", content: question, sources: [] })]);
    startTransition(async () => {
      const result = await sendChatMessage(question, window.location.pathname);
      if (result.ok) {
        setMessages((cur) => [...cur, bubble({ role: "assistant", content: result.reply, sources: result.sources })]);
        setSuggestLead(result.suggestLead);
        return;
      }
      // Câu hỏi chưa gửi được thì trả lại ô nhập để khách không phải gõ lại
      setMessages((cur) => cur.slice(0, -1));
      setText(question);
      setProblem(result.error);
      setProblemText(result.error === "invalid" ? result.message ?? "" : "");
    });
  }

  function closeOnPhone() {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }

  if (!open) {
    return (
      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Mở ${botName}`}
        aria-haspopup="dialog"
        className={`fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-brand-700 text-white shadow-lg hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none print:hidden ${FOCUS_RING}`}
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-8 6 1.3-3.9A8 8 0 1 1 9.9 19.7L5 21Z" />
        </svg>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={botName}
      onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
      className="fixed inset-0 z-[70] flex flex-col bg-white shadow-2xl sm:inset-auto sm:right-4 sm:bottom-4 sm:h-[36rem] sm:max-h-[calc(100dvh-2rem)] sm:w-[24rem] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-gray-200 print:hidden"
    >
      <header className="flex items-center justify-between gap-2 bg-brand-700 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate font-semibold">{botName}</p>
          <p className="text-xs text-white/90">Trợ lý tự động</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setSuggestLead(false);
                setShowLead(false);
                setLeadDone(false);
                setProblem("");
                void resetChat();
                input.current?.focus();
              }}
              className="min-h-11 cursor-pointer rounded-lg px-2 text-xs font-medium text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Cuộc mới
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng trợ lý"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </header>

      <div ref={log} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3 text-sm">
        <div role="log" aria-live="polite" aria-label="Nội dung trò chuyện" className="space-y-3">
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-gray-900 shadow-sm [overflow-wrap:anywhere] whitespace-pre-wrap">{welcome}</p>
          {messages.map((m) => (
            <div key={m.key} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 [overflow-wrap:anywhere] whitespace-pre-wrap ${m.role === "user" ? "rounded-tr-sm bg-brand-700 text-white" : "rounded-tl-sm bg-white text-gray-900 shadow-sm"}`}>
                {m.content}
                {m.role === "assistant" && <Sources items={m.sources} onNavigate={closeOnPhone} />}
              </div>
            </div>
          ))}
          {pending && <p className="w-fit rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-gray-600 shadow-sm motion-safe:animate-pulse" role="status">Đang trả lời...</p>}
        </div>

        {messages.length === 0 && loaded && !pending && (
          <div className="flex flex-col items-start gap-2">
            {STARTERS.map((q) => (
              <button key={q} type="button" onClick={() => send(q)} className={`min-h-11 cursor-pointer rounded-xl border border-brand-200 bg-white px-3 py-2 text-left font-medium text-brand-700 hover:bg-brand-50 ${FOCUS_RING}`}>
                {q}
              </button>
            ))}
          </div>
        )}

        {problem && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-red-700" role="alert">
            {problem === "rate" && "Bạn gửi hơi nhanh. Đợi khoảng một phút rồi thử lại nhé."}
            {problem === "invalid" && problemText}
            {problem === "unavailable" && (
              <>Trợ lý đang bận. Bạn thử lại sau hoặc <Link href="/#contact" onClick={closeOnPhone} className="font-medium underline">gửi tin nhắn qua form liên hệ</Link>.</>
            )}
          </p>
        )}

        {showLead ? (
          <LeadForm
            onCancel={() => { setShowLead(false); input.current?.focus(); }}
            onDone={(name) => {
              setShowLead(false);
              setLeadDone(true);
              setSuggestLead(false);
              setMessages((cur) => [...cur, bubble({ role: "assistant", content: `Cảm ơn ${name}! Đội ngũ Aura sẽ liên hệ với bạn sớm.`, sources: [] })]);
              input.current?.focus();
            }}
          />
        ) : (
          suggestLead && !leadDone && !pending && (
            <button type="button" onClick={() => setShowLead(true)} className={`min-h-11 w-full cursor-pointer rounded-xl bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800 ${FOCUS_RING}`}>
              Để lại thông tin để được tư vấn
            </button>
          )
        )}
      </div>

      <form
        className="border-t border-gray-200 bg-white p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Câu hỏi của bạn</span>
            <textarea
              ref={input}
              rows={1}
              value={text}
              maxLength={MAX_MESSAGE}
              placeholder="Nhập câu hỏi..."
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(text);
                }
              }}
              className="block max-h-28 min-h-11 w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 [field-sizing:content] focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm"
            />
          </label>
          <button
            disabled={pending || !text.trim()}
            aria-label="Gửi câu hỏi"
            className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-brand-700 text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 text-xs text-gray-600">
          <span>Trả lời dựa trên nội dung website, có thể chưa đầy đủ.</span>
          {!leadDone && !showLead && (
            <button type="button" onClick={() => setShowLead(true)} className={`cursor-pointer rounded py-1 font-medium text-brand-700 underline ${FOCUS_RING}`}>
              Để lại thông tin
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
