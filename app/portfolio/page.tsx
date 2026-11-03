import type { Metadata } from "next";
import Link from "next/link";
import { getProjects, getTestimonials } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import { Cta, Testimonials } from "@/components/SectionRenderer";
import SiteShell from "@/components/SiteShell";

const DESCRIPTION = "Những dự án Aura đã triển khai: bài toán của khách hàng, cách giải quyết và kết quả đạt được.";
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export async function generateMetadata(): Promise<Metadata> {
  const projects = await getProjects();
  return {
    title: "Dự án",
    description: DESCRIPTION,
    // Chưa có dự án thì trang không có nội dung để lập chỉ mục
    robots: projects.length === 0 ? { index: false, follow: true } : undefined,
    alternates: { canonical: "/portfolio" },
    openGraph: { title: "Dự án", description: DESCRIPTION, type: "website" },
  };
}

export default async function PortfolioPage() {
  const [projects, testimonials] = await Promise.all([getProjects(), getTestimonials()]);

  return (
    <SiteShell>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <header className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Dự án tiêu biểu</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">{DESCRIPTION}</p>
        </header>

        {projects.length > 0 ? (
          <ul className="mt-10 grid gap-6 md:gap-8 md:grid-cols-2">
            {projects.map((project, i) => {
              const featured = i === 0 && projects.length % 2 === 1;
              return (
                <li key={project.slug} className={featured ? "md:col-span-2" : undefined}>
                  <ProjectCard project={project} featured={featured} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-900">Chưa có dự án nào</h2>
            <p className="mt-2 text-gray-600">Các dự án mới sẽ sớm được cập nhật tại đây.</p>
            <Link
              href="/"
              className={`mt-6 inline-flex min-h-11 items-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 motion-reduce:transition-none ${FOCUS_RING}`}
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </section>

      <Testimonials c={{ title: "Khách hàng nói gì về Aura", items: testimonials }} tone="soft" />
      <Cta
        c={{
          title: "Doanh nghiệp của bạn có bài toán tương tự?",
          text: "Để lại thông tin, đội ngũ Aura sẽ liên hệ để tìm hiểu và tư vấn cách triển khai phù hợp.",
          button_text: "Liên hệ tư vấn",
          button_link: "/#contact",
        }}
      />
    </SiteShell>
  );
}
