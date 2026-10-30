import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/api";
import { safeSrc } from "@/lib/safe";
import SiteShell from "@/components/SiteShell";
import SectionRenderer from "@/components/SectionRenderer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  const title = page.seo_title || page.title;
  const description = page.seo_description ?? undefined;
  const og = safeSrc(page.og_image_url);
  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title, description, type: "website", images: og ? [og] : undefined },
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  const darkTop = page.sections[0]?.type === "hero";

  return (
    <SiteShell darkTop={darkTop}>
      {page.sections.length > 0 ? (
        <SectionRenderer sections={page.sections} pageTitle={page.title} />
      ) : (
        <section className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          <p className="mt-4 text-gray-500">Nội dung đang được cập nhật.</p>
        </section>
      )}
    </SiteShell>
  );
}