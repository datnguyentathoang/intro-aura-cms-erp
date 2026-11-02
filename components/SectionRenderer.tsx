/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import type { PublicSection } from "@/lib/types";
import { list, s, strs, safeHref, safeSrc } from "@/lib/safe";

type C = Record<string, unknown>;
type Tone = "white" | "soft";

function A({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href} className={className}>{children}</Link>;
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  if (!title && !subtitle) return null;
  return (
    <Reveal className="text-center mb-12">
      {title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>}
      {title && <div className="mx-auto mt-4 h-1 w-16 rounded bg-gradient-to-r from-brand-600 to-accent-600" />}
      {subtitle && <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
    </Reveal>
  );
}

function Wrap({ tone, narrow, children }: { tone: Tone; narrow?: boolean; children: ReactNode }) {
  return (
    <section className={`${tone === "soft" ? "bg-slate-50" : "bg-white"} py-20 px-4`}>
      <div className={`${narrow ? "max-w-3xl" : "max-w-7xl"} mx-auto`}>{children}</div>
    </section>
  );
}

const btn = "inline-block rounded-xl px-8 py-3.5 font-medium transition-all hover:-translate-y-0.5";

function Hero({ c, first }: { c: C; first: boolean }) {
  const img = safeSrc(c.image_url);
  const H = first ? "h1" : "h2";
  return (
    <section className={`relative overflow-hidden bg-stone-900 px-4 pb-20 ${first ? "pt-44" : "pt-20"}`}>
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
      <div className={`relative max-w-7xl mx-auto grid gap-12 items-center ${img ? "lg:grid-cols-2" : ""}`}>
        <div className={`text-center ${img ? "lg:text-left" : "max-w-3xl mx-auto"}`}>
          <H className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight text-white text-balance">{s(c.heading)}</H>
          {s(c.subheading) && (
            <p className={`mt-6 text-lg md:text-xl text-white/85 max-w-xl ${img ? "mx-auto lg:mx-0" : "mx-auto"}`}>{s(c.subheading)}</p>
          )}
          {s(c.cta_text) && (
            <div className="mt-10">
              <A href={safeHref(c.cta_link)} className={`${btn} bg-brand-700 text-white hover:bg-brand-800 hover:shadow-xl hover:shadow-brand-600/30`}>
                {s(c.cta_text)}
              </A>
            </div>
          )}
        </div>
        {img && <img src={img} alt="" className="w-full rounded-2xl border border-white/20 shadow-2xl shadow-black/40" />}
      </div>
    </section>
  );
}

function RichText({ c, tone }: { c: C; tone: Tone }) {
  // Nội dung HTML đã được API làm sạch (HtmlSanitizer) khi lưu
  return (
    <Wrap tone={tone} narrow>
      <Heading title={s(c.title)} />
      <Reveal><div className="rich-text" dangerouslySetInnerHTML={{ __html: s(c.html, 60000) }} /></Reveal>
    </Wrap>
  );
}

function FeatureGrid({ c, tone }: { c: C; tone: Tone }) {
  return (
    <Wrap tone={tone}>
      <Heading title={s(c.title)} subtitle={s(c.subtitle)} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list(c.items).map((it, i) => {
          const img = safeSrc(it.image_url);
          return (
            <Reveal key={i} delay={(i % 3) * 120}>
              <div className="hover-shine hover-shine--card h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-200 transition-all duration-300">
                {img ? (
                  <img src={img} alt="" className="mb-4 rounded-xl w-full h-40 object-cover" />
                ) : (
                  <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-700 to-accent-700 text-white flex items-center justify-center font-bold">
                    {s(it.icon, 4) || i + 1}
                  </div>
                )}
                <h3 className="font-semibold text-lg text-gray-900">{s(it.title)}</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{s(it.description)}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Wrap>
  );
}

function ImageText({ c, tone }: { c: C; tone: Tone }) {
  const img = safeSrc(c.image_url);
  const right = s(c.image_side) === "right";
  return (
    <Wrap tone={tone}>
      <div className={`grid gap-10 items-center ${img ? "md:grid-cols-2" : ""}`}>
        {img && (
          <Reveal className={right ? "md:order-last" : ""}>
            <img src={img} alt={s(c.title)} className="w-full rounded-2xl border border-gray-200 shadow-lg" />
          </Reveal>
        )}
        <Reveal delay={120}>
          {s(c.title) && <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{s(c.title)}</h2>}
          {s(c.text) && <p className="mt-5 text-gray-600 leading-relaxed whitespace-pre-line">{s(c.text, 4000)}</p>}
          {s(c.cta_text) && (
            <div className="mt-8">
              <A href={safeHref(c.cta_link)} className={`${btn} bg-brand-700 text-white hover:bg-brand-800`}>{s(c.cta_text)}</A>
            </div>
          )}
        </Reveal>
      </div>
    </Wrap>
  );
}

function Testimonials({ c, tone }: { c: C; tone: Tone }) {
  return (
    <Wrap tone={tone}>
      <Heading title={s(c.title)} subtitle={s(c.subtitle)} />
      <div className="grid md:grid-cols-3 gap-6">
        {list(c.items).map((it, i) => {
          const av = safeSrc(it.avatar_url);
          return (
            <Reveal key={i} delay={(i % 3) * 120}>
              <figure className="h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="text-4xl leading-none text-brand-300" aria-hidden>“</div>
                <blockquote className="mt-2 text-gray-700 leading-relaxed">{s(it.quote, 1200)}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {av ? (
                    <img src={av} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <span className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                      {s(it.name, 1).toUpperCase()}
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold text-gray-900">{s(it.name)}</span>
                    <span className="block text-sm text-gray-500">{s(it.role)}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </Wrap>
  );
}

function Pricing({ c, tone }: { c: C; tone: Tone }) {
  return (
    <Wrap tone={tone}>
      <Heading title={s(c.title)} subtitle={s(c.subtitle)} />
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {list(c.plans).map((p, i) => {
          const hot = p.highlighted === true;
          return (
            <Reveal key={i} delay={(i % 3) * 120}>
              <div className={`h-full flex flex-col rounded-2xl bg-white p-8 ${hot ? "border-2 border-brand-500 shadow-xl" : "border border-gray-100 shadow-sm"}`}>
                <h3 className="text-xl font-bold text-gray-900">{s(p.name)}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{s(p.price, 40)}</span>
                  {s(p.period, 30) && <span className="text-gray-500"> / {s(p.period, 30)}</span>}
                </p>
                {s(p.description) && <p className="mt-3 text-sm text-gray-600">{s(p.description)}</p>}
                <ul className="mt-6 space-y-2 text-sm text-gray-700 flex-1">
                  {strs(p.features).map((f, k) => (
                    <li key={k} className="flex gap-2"><span className="text-brand-700" aria-hidden>✓</span>{f.slice(0, 200)}</li>
                  ))}
                </ul>
                {s(p.cta_text) && (
                  <div className="mt-8">
                    <A href={safeHref(p.cta_link)}
                       className={`block text-center rounded-xl px-6 py-3 font-medium transition-colors ${hot ? "bg-brand-700 text-white hover:bg-brand-800" : "border border-gray-300 text-gray-800 hover:bg-gray-50"}`}>
                      {s(p.cta_text)}
                    </A>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Wrap>
  );
}

function Team({ c, tone }: { c: C; tone: Tone }) {
  return (
    <Wrap tone={tone}>
      <Heading title={s(c.title)} subtitle={s(c.subtitle)} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {list(c.members).map((m, i) => {
          const ph = safeSrc(m.photo_url);
          return (
            <Reveal key={i} delay={(i % 4) * 100}>
              <div className="text-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full">
                {ph ? (
                  <img src={ph} alt={s(m.name)} className="mx-auto w-28 h-28 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-brand-700 to-accent-700 text-white text-3xl font-bold flex items-center justify-center">
                    {s(m.name, 1).toUpperCase()}
                  </div>
                )}
                <h3 className="mt-4 font-semibold text-gray-900">{s(m.name)}</h3>
                <p className="text-sm text-brand-700">{s(m.role)}</p>
                {s(m.bio) && <p className="mt-3 text-sm text-gray-600">{s(m.bio, 600)}</p>}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Wrap>
  );
}

function Cta({ c }: { c: C }) {
  return (
    <section className="px-4 py-20 bg-white">
      <Reveal className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-brand-700 to-accent-700 px-8 py-14 text-center text-white shadow-xl">
        {s(c.title) && <h2 className="text-3xl md:text-4xl font-bold">{s(c.title)}</h2>}
        {s(c.text) && <p className="mt-4 text-white/90 max-w-2xl mx-auto">{s(c.text, 1000)}</p>}
        {s(c.button_text) && (
          <div className="mt-8">
            <A href={safeHref(c.button_link)} className={`${btn} bg-white text-brand-700 hover:shadow-xl`}>{s(c.button_text)}</A>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function Faq({ c, tone }: { c: C; tone: Tone }) {
  return (
    <Wrap tone={tone} narrow>
      <Heading title={s(c.title)} />
      {list(c.items).map((q, i) => (
        <Reveal key={i} delay={i * 60}>
          <details className="group bg-white border border-gray-100 rounded-xl p-5 mb-3 shadow-sm hover:shadow-md transition-shadow">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              {s(q.question)}
              <span className="ml-4 text-brand-700 text-xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line">{s(q.answer, 3000)}</p>
          </details>
        </Reveal>
      ))}
    </Wrap>
  );
}

const TONED = new Set(["rich_text", "feature_grid", "image_text", "testimonials", "pricing", "team", "faq"]);

export default function SectionRenderer({ sections, pageTitle }: { sections: PublicSection[]; pageTitle: string }) {
  // Xen kẽ nền trắng và nền xám nhạt giữa các section liên tiếp
  const tones: Tone[] = [];
  let n = 0;
  for (const sec of sections) tones.push(TONED.has(sec.type) ? (n++ % 2 === 0 ? "white" : "soft") : "white");

  return (
    <>
      {sections[0]?.type !== "hero" && <h1 className="sr-only">{pageTitle}</h1>}
      {sections.map((sec, i) => {
        const c: C = sec.content && typeof sec.content === "object" ? sec.content : {};
        const tone = tones[i];
        switch (sec.type) {
          case "hero": return <Hero key={sec.id} c={c} first={i === 0} />;
          case "rich_text": return <RichText key={sec.id} c={c} tone={tone} />;
          case "feature_grid": return <FeatureGrid key={sec.id} c={c} tone={tone} />;
          case "image_text": return <ImageText key={sec.id} c={c} tone={tone} />;
          case "testimonials": return <Testimonials key={sec.id} c={c} tone={tone} />;
          case "pricing": return <Pricing key={sec.id} c={c} tone={tone} />;
          case "team": return <Team key={sec.id} c={c} tone={tone} />;
          case "cta": return <Cta key={sec.id} c={c} />;
          case "faq": return <Faq key={sec.id} c={c} tone={tone} />;
          default: return null;
        }
      })}
    </>
  );
}