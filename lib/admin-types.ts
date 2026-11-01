
export type AdminSection = {
  id: string;
  page_id: string;
  type: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_published: boolean;
};

export type AdminPage = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  sections: AdminSection[];
};

export type PageListItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  section_count: number;
};

export type AdminMenuItem = {
  id: string;
  parent_id: string | null;
  label: string;
  page_id: string | null;
  page_title: string | null;
  page_slug: string | null;
  url: string | null;
  sort_order: number;
  is_published: boolean;
};
