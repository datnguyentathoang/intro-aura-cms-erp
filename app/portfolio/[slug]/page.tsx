import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/api";
import { safeSrc } from "@/lib/safe";
import type { ProjectDetail } from "@/lib/types";
import ProjectArticle from "@/components/ProjectArticle";
import ProjectCard from "@/components/ProjectCard";
import { Cta } from "@/components/SectionRenderer";
import SiteShell from "@/components/SiteShell";

type Props = { params: Promise<{ slug: string }> };

// Dữ liệu có cấu trúc cho công cụ tìm kiếm; thay "<" để nội dung không thể đóng thẻ script
function projectJsonLd(project: ProjectDetail, image: string | null) {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.title,
    description: project.seo_description || project.summary || undefined,
    image: image?.startsWith("/") ? `${base}${image}` : image ?? undefined,
    datePublished: project.published_at ?? undefined,
    dateModified: project.updated_at,
    author: { "@type": "Organization", name: "Aura" },
    mainEntityOfPage: `${base}/portfolio/${project.slug}`,
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) notFound();
  const { project } = data;
  const title = project.seo_title || project.title;
  const description = project.seo_description || project.summary || undefined;
  const image = safeSrc(project.thumbnail_url);
  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: project.published_at ?? undefined,
      modifiedTime: project.updated_at,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) notFound();

  const { project, related } = data;

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: projectJsonLd(project, safeSrc(project.thumbnail_url)) }} />

      <ProjectArticle project={project} />

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 id="related-title" className="text-2xl font-bold tracking-tight text-gray-900">Dự án khác</h2>
            <ul className="mt-8 grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <ProjectCard project={r} titleAs="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
