import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/api";
import { safeSrc } from "@/lib/safe";
import type { BlogPostDetail } from "@/lib/types";
import PostArticle from "@/components/PostArticle";
import PostCard from "@/components/PostCard";
import SiteShell from "@/components/SiteShell";

type Props = { params: Promise<{ slug: string }> };

// Dữ liệu có cấu trúc cho công cụ tìm kiếm; thay "<" để nội dung không thể đóng thẻ script
function articleJsonLd(post: BlogPostDetail, image: string | null) {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: image?.startsWith("/") ? `${base}${image}` : image ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author_name || "Aura" },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogPost(slug);
  if (!data) notFound();
  const { post } = data;
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;
  const image = safeSrc(post.thumbnail_url);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author_name ? [post.author_name] : undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBlogPost(slug);
  if (!data) notFound();

  const { post, related } = data;

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(post, safeSrc(post.thumbnail_url)) }} />

      <PostArticle post={post} />

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 id="related-title" className="text-2xl font-bold tracking-tight text-gray-900">Bài viết liên quan</h2>
            <ul className="mt-8 grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <PostCard post={r} titleAs="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
