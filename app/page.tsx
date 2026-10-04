/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { submitMessage } from "@/lib/actions";
import Navbar from "@/components/Navbar";
import Reveal from "@/components/Reveal";
import type {
  Contact,
  Faq,
  Feature,
  Hero,
  Screenshot,
  Workflow,
} from "@/lib/types";

const inputCls =
  "w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <Reveal className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded bg-gradient-to-r from-blue-600 to-indigo-600" />
      {sub && <p className="mt-4 text-gray-600 max-w-2xl mx-auto">{sub}</p>}
    </Reveal>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  const supabase = await createClient();

  const [hero, features, workflows, shots, faqs, contact] = await Promise.all([
    supabase.from("hero").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("features")
      .select("*")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("workflows")
      .select("*, workflow_steps(*)")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("screenshots")
      .select("*")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order"),
    supabase.from("contact_info").select("*").eq("id", 1).maybeSingle(),
  ]);

  const h = hero.data as Hero | null;
  const c = contact.data as Contact | null;
  const featureList = (features.data ?? []) as Feature[];
  const workflowList = (workflows.data ?? []) as Workflow[];
  const shotList = (shots.data ?? []) as Screenshot[];
  const faqList = (faqs.data ?? []) as Faq[];

  return (
    <>
      <Navbar
        brand={h?.brand_name ?? undefined}
        logoUrl={h?.logo_url ?? undefined}
        marquee={h?.marquee_text ?? undefined}
      />
      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden pt-44 pb-24 px-4 bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-blob [animation-delay:3s]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <span className="animate-fade-up inline-block mb-5 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              Giải pháp quản lý kho & bán hàng
            </span>
            <h1 className="animate-fade-up [animation-delay:150ms] text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              {h?.title}
            </h1>
            <p className="animate-fade-up [animation-delay:300ms] mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              {h?.subtitle}
            </p>
            {h?.cta_text && (
              <div className="animate-fade-up [animation-delay:450ms] mt-10 flex justify-center gap-4">
                <a
                  href={h.cta_link || "#contact"}
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
                >
                  {h.cta_text}
                </a>
                <a
                  href="#features"
                  className="px-8 py-3.5 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition"
                >
                  Xem tính năng
                </a>
              </div>
            )}
          </div>
          {h?.image_url && (
            <div className="animate-fade-up [animation-delay:600ms] relative max-w-5xl mx-auto mt-16">
              <img
                src={h.image_url}
                alt=""
                className="animate-float w-full rounded-2xl border border-gray-200 shadow-2xl shadow-blue-900/20"
              />
            </div>
          )}
        </section>

        {/* TÍNH NĂNG */}
        {featureList.length > 0 && (
          <section id="features" className="max-w-6xl mx-auto py-24 px-4">
            <SectionTitle
              title="Tính năng nổi bật"
              sub="Mọi thứ bạn cần để quản lý kho, sản xuất và công nợ trong một hệ thống."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureList.map((f, i) => (
                <Reveal key={f.id} delay={(i % 3) * 120}>
                  <div className="hover-shine hover-shine--card group h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300">
                    {f.image_url ? (
                      <img
                        src={f.image_url}
                        alt=""
                        className="mb-4 rounded-xl w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
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

        {/* LUỒNG NGHIỆP VỤ */}
        {workflowList.length > 0 && (
          <section id="workflows" className="bg-slate-50 py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <SectionTitle
                title="Luồng nghiệp vụ chính"
                sub="Từng bước rõ ràng, từ mua hàng đến thu tiền."
              />
              <div className="space-y-10">
                {workflowList.map((w) => (
                  <Reveal key={w.id}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                        {w.title}
                      </h3>
                      <p className="text-gray-600 mt-2">{w.description}</p>
                      {w.image_url && (
                        <img
                          src={w.image_url}
                          alt=""
                          className="mt-5 rounded-xl border"
                        />
                      )}
                      <ol className="mt-8 ml-4 border-l-2 border-blue-100 space-y-6">
                        {[...(w.workflow_steps ?? [])]
                          .sort((a, b) => a.step_order - b.step_order)
                          .map((s) => (
                            <li key={s.id} className="relative pl-8">
                              <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center ring-4 ring-white">
                                {s.step_order}
                              </span>
                              <p className="font-semibold text-gray-900">
                                {s.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {s.description}
                              </p>
                            </li>
                          ))}
                      </ol>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ẢNH CHỤP MÀN HÌNH */}
        {shotList.length > 0 && (
          <section id="screenshots" className="max-w-6xl mx-auto py-24 px-4">
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
          </section>
        )}

        {/* FAQ */}
        {faqList.length > 0 && (
          <section id="faq" className="bg-slate-50 py-24 px-4">
            <div className="max-w-3xl mx-auto">
              <SectionTitle title="Câu hỏi thường gặp" />
              {faqList.map((q, i) => (
                <Reveal key={q.id} delay={i * 80}>
                  <details className="group bg-white border border-gray-100 rounded-xl p-5 mb-3 shadow-sm hover:shadow-md transition-shadow">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                      {q.question}
                      <span className="ml-4 text-blue-600 text-xl transition-transform group-open:rotate-45">
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
        <section id="contact" className="max-w-5xl mx-auto py-24 px-4">
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
                    href={c.facebook}
                    className="text-blue-600 hover:underline"
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
                <input
                  name="name"
                  placeholder="Họ tên"
                  required
                  className={inputCls}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className={inputCls}
                />
                <textarea
                  name="message"
                  placeholder="Nội dung"
                  rows={4}
                  required
                  className={inputCls}
                />
                <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all">
                  Gửi tin nhắn
                </button>
              </form>
            </Reveal>
          </div>
        </section>

        <footer className="bg-gray-900 text-gray-400 text-sm text-center py-8">
          © {new Date().getFullYear()} {h?.brand_name || "Aura ERP"}. Giải pháp
          quản lý kho & bán hàng.
        </footer>
      </main>
    </>
  );
}
