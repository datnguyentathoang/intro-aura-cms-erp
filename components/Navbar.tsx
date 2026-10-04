"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, CSSProperties } from "react";

const LINKS = [
  { id: "features", label: "Tính năng" },
  { id: "workflows", label: "Quy trình" },
  { id: "screenshots", label: "Giao diện" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Liên hệ" },
];

export default function Navbar({
  brand = "Aura ERP",
  logoUrl,
  marquee,
}: {
  brand?: string;
  logoUrl?: string;
  marquee?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-bold text-lg">
          {logoUrl ? (
            <span
              className="logo-shine"
              style={{ "--logo": `url("${logoUrl}")` } as CSSProperties}
            >
              <img
                src={logoUrl}
                alt={brand}
                className="h-10 w-auto object-contain"
              />
            </span>
          ) : (
            <span className="logo-shine rounded-lg">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm">
                {brand.charAt(0)}
              </span>
            </span>
          )}
          {brand}
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active === l.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden md:inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all"
        >
          Liên hệ tư vấn
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Mở menu"
        >
          <div className="w-5 space-y-1.5">
            <span
              className={`block h-0.5 bg-gray-800 transition-all ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 bg-gray-800 transition-all ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 bg-gray-800 transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      {/* DẢI CHỮ CHẠY TỪ TRÁI SANG PHẢI */}
      {marquee && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm overflow-hidden">
          <div className="marquee-track py-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex shrink-0 min-w-[100vw] justify-around"
                aria-hidden={i === 1}
              >
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

      <div
        className={`md:hidden overflow-hidden bg-white shadow-md transition-all duration-300 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        {LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-gray-700 border-b border-gray-100 hover:bg-blue-50"
          >
            {l.label}
          </a>
        ))}
      </div>
    </header>
  );
}
