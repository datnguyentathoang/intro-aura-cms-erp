import type { Metadata } from "next";
import Link from "next/link";
import { getHomeSafe, getPricingPlans, getTestimonials } from "@/lib/api";
import { Cta, Faq, Pricing, Testimonials } from "@/components/SectionRenderer";
import SiteShell from "@/components/SiteShell";

const DESCRIPTION = "Chọn gói phù hợp với quy mô doanh nghiệp của bạn, hoặc liên hệ để được tư vấn.";
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export async function generateMetadata(): Promise<Metadata> {
  const plans = await getPricingPlans();
  return {
    title: "Bảng giá",
    description: DESCRIPTION,
    // Chưa có gói nào thì trang không có nội dung để lập chỉ mục
    robots: plans.length === 0 ? { index: false, follow: true } : undefined,
    alternates: { canonical: "/pricing" },
    openGraph: { title: "Bảng giá", description: DESCRIPTION, type: "website" },
  };
}

export default async function PricingPage() {
  const [plans, testimonials, home] = await Promise.all([getPricingPlans(), getTestimonials(), getHomeSafe()]);

  return (
    <SiteShell>
      {plans.length > 0 ? (
        <Pricing c={{ title: "Bảng giá", subtitle: DESCRIPTION, plans }} tone="white" headingAs="h1" />
      ) : (
        <section className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Bảng giá</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Bảng giá đang được cập nhật. Hãy liên hệ để nhận báo giá theo quy mô doanh nghiệp của bạn.
          </p>
          <Link
            href="/#contact"
            className={`mt-8 inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-6 font-medium text-white hover:bg-brand-800 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
          >
            Liên hệ tư vấn
          </Link>
        </section>
      )}

      <Testimonials c={{ title: "Khách hàng nói gì về Aura", items: testimonials }} tone="soft" />
      <Faq c={{ title: "Câu hỏi thường gặp", items: home?.faqs ?? [] }} tone={testimonials.length > 0 ? "white" : "soft"} />
      <Cta
        c={{
          title: "Chưa chắc gói nào phù hợp?",
          text: "Để lại thông tin, đội ngũ Aura sẽ liên hệ và tư vấn theo nhu cầu của doanh nghiệp bạn.",
          button_text: "Liên hệ tư vấn",
          button_link: "/#contact",
        }}
      />
    </SiteShell>
  );
}
