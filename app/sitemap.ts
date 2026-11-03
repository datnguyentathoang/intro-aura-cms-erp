// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getBlogCategories, getBlogSlugs, getPublishedPages } from "@/lib/api";
import { blogHref } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const [pages, posts, categories] = await Promise.all([getPublishedPages(), getBlogSlugs(), getBlogCategories()]);
  return [
    { url: base, lastModified: new Date() },
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(p.updated_at) })),
    { url: `${base}/blog` },
    ...categories.filter((c) => c.post_count > 0).map((c) => ({ url: `${base}${blogHref({ category: c.slug })}` })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updated_at) })),
  ];
}
