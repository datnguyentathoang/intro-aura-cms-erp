/* eslint-disable @next/next/no-img-element */
import { getHomeSafe, getMenu } from "@/lib/api";
import { submitMessage } from "@/lib/actions";
import { safeHref } from "@/lib/safe";
import SubmitButton from "@/components/admin/SubmitButton";
import Navbar from "@/components/Navbar";
import HeroVideo from "@/components/HeroVideo";
import Reveal from "@/components/Reveal";

const inputCls =
  "mt-1 w-full border border-gray-300 rounded-lg p-3 font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition";
const labelCls = "block text-sm font-medium text-gray-700";

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <Reveal className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded bg-gradient-to-r from-brand-600 to-accent-600" />
      {sub && <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{sub}</p>}
    </Reveal>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const [home, menu] = await Promise.all([getHomeSafe(), getMenu()]);
  const safeHome = home ?? {
    hero: null,
    features: [],
    screenshots: [],
    faqs: [],
    contact: null,
  };
  const h = safeHome.hero;
  const c = safeHome.contact;
  const featureList = safeHome.features;
  const shotList = safeHome.screenshots;
  const faqList = safeHome.faqs;

  return (
    <>
      <Navbar
        brand={h?.brand_name ?? undefined}
        logoUrl={h?.logo_url ?? undefined}
        marquee={h?.marquee_text ?? undefined}
        menu={menu}
      />
      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden min-h-[90svh] flex items-center pt-36 pb-16 md:pt-40 md:pb-20 px-4 bg-stone-900">
          <HeroVideo src="/hero-bg.mp4" poster="/hero-poster.jpg" />
          {/* Lớp phủ tối để chữ dễ đọc */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Chuyển mềm xuống nền trắng của mục bên dưới */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />

          <div
            className={`relative w-full max-w-7xl mx-auto grid gap-12 items-center ${
              h?.image_url ? "lg:grid-cols-2" : ""
            }`}
          >
            {/* CỘT CHỮ */}
            <div
              className={`text-center ${
                h?.image_url ? "lg:text-left" : "max-w-3xl mx-auto"
              }`}
            >
              <span className="animate-fade-up inline-block mb-5 px-4 py-1.5 rounded-full bg-white/15 text-white backdrop-blur text-sm font-medium">
                Giải pháp quản lý kho & bán hàng
              </span>
              <h1 className="animate-fade-up [animation-delay:150ms] text-balance text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight text-white">
                {h?.title}
              </h1>
              <p
                className={`animate-fade-up [animation-delay:300ms] mt-6 text-lg md:text-xl text-white/90 max-w-xl ${
                  h?.image_url ? "mx-auto lg:mx-0" : "mx-auto"
                }`}
              >
                {h?.subtitle}
              </p>
              {h?.cta_text && (
                <div
                  className={`animate-fade-up [animation-delay:450ms] mt-10 flex flex-wrap justify-center gap-4 ${
                    h?.image_url ? "lg:justify-start" : ""
                  }`}
                >
                  <a
                    href={safeHref(h.cta_link || "#contact")}
                    className="bg-brand-700 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-brand-800 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/30 transition-all"
                  >
                    {h.cta_text}
                  </a>
                  <a
                    href="#features"
                    className="px-8 py-3.5 rounded-xl font-medium border border-white/60 text-white hover:bg-white/10 transition"
                  >
                    Xem tính năng
                  </a>
                </div>
              )}
            </div>

            {/* CỘT ẢNH */}
            {h?.image_url && (
              <div className="animate-fade-up [animation-delay:400ms]">
                <img
                  src={h.image_url}
                  alt=""
                  className="animate-float w-full rounded-2xl border border-white/20 shadow-2xl shadow-black/40"
                />
              </div>
            )}
          </div>
        </section>

        {/* TÍNH NĂNG */}
        {featureList.length > 0 && (
          <section id="features" className="max-w-7xl mx-auto py-24 px-4">
            <SectionTitle
              title="Tính năng nổi bật"
              sub="Mọi thứ bạn cần để quản lý kho, sản xuất và công nợ trong một hệ thống."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureList.map((f, i) => (
                <Reveal key={f.id} delay={(i % 3) * 120}>
                  <div className="hover-shine hover-shine--card group h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-brand-200 transition-all duration-300">
                    {f.image_url ? (
                      <img
                        src={f.image_url}
                        alt=""
                        className="mb-4 rounded-xl w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-700 to-accent-700 text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                    )}
                    <h3 className="font-semibold text-lg text-gray-900">
                      {f.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ẢNH CHỤP MÀN HÌNH */}
        {shotList.length > 0 && (
          <section id="screenshots" className="bg-slate-50 py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <SectionTitle
                title="Giao diện hệ thống"
                sub="Hình ảnh thực tế từ phần mềm."
              />
              <div className="grid md:grid-cols-2 gap-8">
                {shotList.map((s, i) => (
                  <Reveal key={s.id} delay={(i % 2) * 150}>
                    <figure className="hover-shine group overflow-hidden rounded-2xl border border-gray-200 shadow-md hover:shadow-2xl transition-shadow">
                      <div className="overflow-hidden">
                        <img
                          src={s.image_url}
                          alt={s.caption ?? ""}
                          className="w-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {s.caption && (
                        <figcaption className="p-4 text-sm text-gray-700 text-center bg-white">
                          {s.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqList.length > 0 && (
          <section id="faq" className="py-24 px-4">
            <div className="max-w-3xl mx-auto">
              <SectionTitle title="Câu hỏi thường gặp" />
              {faqList.map((q, i) => (
                <Reveal key={q.id} delay={i * 80}>
                  <details className="group bg-white border border-gray-100 rounded-xl p-5 mb-3 shadow-sm hover:shadow-md transition-shadow">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                      {q.question}
                      <span className="ml-4 text-brand-700 text-xl transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-gray-600 leading-relaxed">
                      {q.answer}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* LIÊN HỆ */}
        <section id="contact" className="bg-slate-50 py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <SectionTitle
              title="Liên hệ với chúng tôi"
              sub="Để lại thông tin, chúng tôi sẽ tư vấn miễn phí."
            />
            <div className="grid md:grid-cols-2 gap-10">
              <Reveal className="space-y-4 text-gray-700">
                {c?.email && (
                  <p>
                    <span className="font-semibold">Email:</span> {c.email}
                  </p>
                )}
                {c?.phone && (
                  <p>
                    <span className="font-semibold">Điện thoại:</span> {c.phone}
                  </p>
                )}
                {c?.zalo && (
                  <p>
                    <span className="font-semibold">Zalo:</span> {c.zalo}
                  </p>
                )}
                {c?.address && (
                  <p>
                    <span className="font-semibold">Địa chỉ:</span> {c.address}
                  </p>
                )}
                {c?.facebook && (
                  <p>
                    <a
                      href={safeHref(c.facebook)}
                      className="text-brand-700 hover:underline"
                    >
                      Facebook
                    </a>
                  </p>
                )}
              </Reveal>
              <Reveal delay={150}>
                <form
                  action={submitMessage}
                  className="space-y-3 bg-white border border-gray-100 shadow-lg rounded-2xl p-6"
                >
                  {sent && (
                    <p className="text-green-600 font-medium">
                      Đã gửi, chúng tôi sẽ liên hệ lại sớm!
                    </p>
                  )}
                  {error && (
                    <p className="text-red-600 font-medium">
                      Gửi không thành công, vui lòng kiểm tra thông tin và thử
                      lại.
                    </p>
                  )}
                  <label className={labelCls}>
                    Họ tên
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    Email
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={inputCls}
                    />
                  </label>
                  <label className={labelCls}>
                    Nội dung
                    <textarea
                      name="message"
                      rows={4}
                      required
                      className={inputCls}
                    />
                  </label>
                  <SubmitButton label="Gửi tin nhắn" pendingLabel="Đang gửi..." block />
                </form>
              </Reveal>
            </div>
          </div>
        </section>

        <footer className="bg-stone-900 text-stone-400 text-sm text-center py-8">
          © {new Date().getFullYear()} {h?.brand_name || "Aura ERP"}. Giải pháp
          quản lý kho & bán hàng.
        </footer>
      </main>
    </>
  );
}
