"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuNode } from "@/lib/types";

const ANCHORS = [
  { id: "features", label: "Tính năng" },
  { id: "workflows", label: "Quy trình" },
  { id: "screenshots", label: "Giao diện" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Liên hệ" },
];

// Tên nhóm theo cấp để dropdown lồng nhau chỉ mở đúng cấp đang rê chuột
const GROUP = ["group/m0", "group/m1", "group/m2", "group/m3"];
const SHOW = [
  "group-hover/m0:block group-focus-within/m0:block",
  "group-hover/m1:block group-focus-within/m1:block",
  "group-hover/m2:block group-focus-within/m2:block",
  "group-hover/m3:block group-focus-within/m3:block",
];

function Anchor({
  href, className, children, onClick, style,
}: { href: string; className?: string; children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} className={className} onClick={onClick} style={style}>{children}</Link>;
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} className={className} onClick={onClick} style={style}
       {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

type Props = { brand?: string; logoUrl?: string; marquee?: string; menu?: MenuNode[]; forceSolid?: boolean };

export default function Navbar({ brand = "Aura ERP", logoUrl, marquee, menu = [], forceSolid = false }: Props) {
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/";
  const anchorMode = menu.length === 0;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Esc đóng menu di động và trả focus về nút menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!anchorMode || !onHome) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ANCHORS.forEach((a) => {
      const el = document.getElementById(a.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [anchorMode, onHome]);

  const solid = forceSolid || scrolled || open;

  const items: MenuNode[] = anchorMode
    ? ANCHORS.map((a) => ({ id: a.id, label: a.label, href: `${onHome ? "" : "/"}#${a.id}`, children: [] }))
    : menu;

  const isActive = (m: MenuNode) =>
    anchorMode ? onHome && m.href === `#${active}` : m.href !== null && m.href === pathname;
  const hasActive = (m: MenuNode): boolean => isActive(m) || m.children.some(hasActive);

  const topCls = (a: boolean) =>
    `inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      a
        ? "text-brand-700 bg-brand-50"
        : solid
          ? "text-gray-600 hover:text-brand-700 hover:bg-gray-100"
          : "text-white/90 hover:text-white hover:bg-white/10"
    }`;

  const renderDesktop = (m: MenuNode, depth: number): ReactNode => {
    const d = Math.min(depth, 3);
    const kids = m.children;
    const now = hasActive(m);
    const cls =
      depth === 0
        ? topCls(now)
        : `flex items-center justify-between gap-3 px-4 py-2 text-sm whitespace-nowrap transition-colors ${
            now ? "text-brand-700 bg-brand-50" : "text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          }`;
    const label = (
      <>
        {m.label}
        {kids.length > 0 && <span aria-hidden className="text-[10px] opacity-60">{depth === 0 ? "▾" : "▸"}</span>}
      </>
    );
    return (
      <li key={m.id} className={`relative ${GROUP[d]}`}>
        {m.href ? (
          <Anchor href={m.href} className={cls}>{label}</Anchor>
        ) : (
          <span tabIndex={0} className={`${cls} cursor-default`}>{label}</span>
        )}
        {kids.length > 0 && (
          <div className={`absolute z-50 hidden ${SHOW[d]} ${depth === 0 ? "left-0 top-full pt-2" : "left-full top-0 pl-1"}`}>
            <ul className="min-w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
              {kids.map((k) => renderDesktop(k, depth + 1))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  const renderMobile = (m: MenuNode, depth: number): ReactNode => {
    const pad = { paddingLeft: 24 + depth * 16 };
    return (
      <li key={m.id}>
        {m.href ? (
          <Anchor href={m.href} onClick={() => setOpen(false)} style={pad}
                  className="block py-3 pr-6 text-gray-700 border-b border-gray-100 hover:bg-brand-50">
            {m.label}
          </Anchor>
        ) : (
          <span style={pad} className="block py-3 pr-6 font-semibold text-gray-500 border-b border-gray-100">{m.label}</span>
        )}
        {m.children.length > 0 && <ul>{m.children.map((k) => renderMobile(k, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <Anchor
          href={onHome ? "#top" : "/"}
          className={`flex items-center gap-2 font-bold text-lg transition-colors ${solid ? "text-gray-900" : "text-white"}`}
        >
          {logoUrl ? (
            <span className="logo-shine" style={{ "--logo": `url("${logoUrl}")` } as CSSProperties}>
              <img src={logoUrl} alt={brand} className="h-10 w-auto object-contain" />
            </span>
          ) : (
            <span className="logo-shine rounded-lg">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-accent-700 text-white flex items-center justify-center text-sm">
                {brand.charAt(0)}
              </span>
            </span>
          )}
          {brand}
        </Anchor>

        <ul className="hidden md:flex items-center gap-1">{items.map((m) => renderDesktop(m, 0))}</ul>

        <Anchor
          href={onHome ? "#contact" : "/#contact"}
          className="hidden md:inline-block bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-600/30 transition-all"
        >
          Liên hệ tư vấn
        </Anchor>

        <button
          ref={toggleRef}
          onClick={() => setOpen(!open)}
          className={`md:hidden flex w-11 h-11 items-center justify-center rounded-lg transition-colors ${solid ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 transition-all ${solid ? "bg-gray-800" : "bg-white"} ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 transition-all ${solid ? "bg-gray-800" : "bg-white"} ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 transition-all ${solid ? "bg-gray-800" : "bg-white"} ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {marquee && (
        <div className="bg-gradient-to-r from-brand-700 to-accent-700 text-white text-sm overflow-hidden">
          <div className="marquee-track py-1.5">
            {[0, 1].map((i) => (
              <div key={i} className="flex shrink-0 min-w-[100vw] justify-around" aria-hidden={i === 1}>
                {[0, 1].map((j) => (
                  <span key={j} className="whitespace-nowrap px-10">
                    {marquee}
                    <span className="ml-10 opacity-60">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* inert: khi đóng, link bên trong không nhận focus bằng phím Tab */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`md:hidden overflow-y-auto bg-white shadow-md transition-all duration-300 ${
          open ? "max-h-[80vh]" : "max-h-0"
        }`}
      >
        <ul>{items.map((m) => renderMobile(m, 0))}</ul>
      </div>
    </header>
  );
}