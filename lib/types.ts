export type Row = Record<string, unknown>

export type Feature = {
  id: string
  title: string
  description: string | null
  image_url: string | null
}
export type Screenshot = { id: string; caption: string | null; image_url: string }
export type Faq = { id: string; question: string; answer: string }
export type Hero = {
  title: string; subtitle: string | null; image_url: string | null
  cta_text: string | null; cta_link: string | null
  marquee_text: string | null
  logo_url: string | null
  brand_name: string | null
}
export type Contact = {
  email: string | null; phone: string | null; address: string | null
  facebook: string | null; zalo: string | null
}
export type MenuNode = { id: string; label: string; href: string | null; children: MenuNode[] };
export type PublicSection = { id: string; type: string; content: Record<string, unknown> };
export type PublicPage = {
  slug: string; title: string;
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
  published_at: string | null; updated_at: string;
  sections: PublicSection[];
};
export type AdminSection = {
  id: string; page_id: string; type: string;
  content: Record<string, unknown>; sort_order: number; is_published: boolean;
};
export type AdminPage = {
  id: string; slug: string; title: string; status: "draft" | "published";
  seo_title: string | null; seo_description: string | null; og_image_url: string | null;
  published_at: string | null; created_at: string; updated_at: string;
  sections: AdminSection[];
};
export type PageListItem = {
  id: string; slug: string; title: string; status: string;
  published_at: string | null; updated_at: string; section_count: number;
};
export type AdminMenuItem = {
  id: string; parent_id: string | null; label: string;
  page_id: string | null; page_title: string | null; page_slug: string | null;
  url: string | null; sort_order: number; is_published: boolean;
};
export type PostCategoryRef = { name: string; slug: string };
export type BlogPostCard = {
  title: string; slug: string; excerpt: string | null; thumbnail_url: string | null;
  author_name: string | null; published_at: string | null; read_minutes: number;
  categories: PostCategoryRef[];
};
export type BlogPostList = { items: BlogPostCard[]; total: number; page: number; page_size: number };
export type BlogCategory = PostCategoryRef & { description: string | null; post_count: number };
export type BlogRelatedPost = Omit<BlogPostCard, "author_name" | "categories">;
export type BlogPostDetail = BlogPostCard & {
  content: string; seo_title: string | null; seo_description: string | null; updated_at: string;
};
export type BlogPostData = { post: BlogPostDetail; related: BlogRelatedPost[] };

export type ProjectListItem = {
  title: string; slug: string; client_name: string | null; industry: string | null;
  summary: string | null; thumbnail_url: string | null;
};
export type ProjectImage = { image_url: string; caption: string | null };
export type ProjectDetail = ProjectListItem & {
  content: string; seo_title: string | null; seo_description: string | null;
  published_at: string | null; updated_at: string; images: ProjectImage[];
};
export type ProjectData = { project: ProjectDetail; related: ProjectListItem[] };
export type PublicTeamMember = { name: string; role: string | null; bio: string | null; photo_url: string | null };
export type PublicTestimonial = { quote: string; name: string; role: string | null; avatar_url: string | null };
export type PublicPricingPlan = {
  name: string; price: string | null; period: string | null; description: string | null;
  features: string[]; highlighted: boolean; cta_text: string | null; cta_link: string | null;
};

export type ChatConfig = { enabled: boolean; bot_name: string; welcome_message: string };
