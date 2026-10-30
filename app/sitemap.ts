// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getPublishedPages } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const pages = await getPublishedPages();
  return [
    { url: base, lastModified: new Date() },
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(p.updated_at) })),
  ];
}