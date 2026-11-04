
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

export type AdminPostStatus = "draft" | "published" | "archived";

export type AdminPostListItem = {
  id: string;
  title: string;
  slug: string;
  status: AdminPostStatus;
  thumbnail_url: string | null;
  author_name: string | null;
  published_at: string | null;
  updated_at: string;
  categories: { id: string; name: string }[];
};

export type AdminPostList = { items: AdminPostListItem[]; total: number; page: number; page_size: number };

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  status: AdminPostStatus;
  author_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  read_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category_ids: string[];
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
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

export type AdminProjectStatus = "draft" | "published";

export type AdminProjectListItem = {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  industry: string | null;
  thumbnail_url: string | null;
  status: AdminProjectStatus;
  published_at: string | null;
  updated_at: string;
  image_count: number;
};

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  industry: string | null;
  summary: string | null;
  content: string;
  thumbnail_url: string | null;
  status: AdminProjectStatus;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  images: { image_url: string; caption: string | null }[];
};

export type AdminLeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type AdminLeadListItem = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: AdminLeadStatus;
  source: string;
  chat_session_id: string | null;
  created_at: string;
};

export type AdminLeadList = {
  items: AdminLeadListItem[];
  total: number;
  page: number;
  page_size: number;
  counts: { status: string; count: number }[];
};

export type AdminLead = AdminLeadListItem & { notes: string | null; updated_at: string | null };

export type AdminChatListItem = {
  id: string;
  page_url: string | null;
  message_count: number;
  created_at: string;
  last_message_at: string;
  first_question: string | null;
  lead_id: string | null;
};

export type AdminChatList = { items: AdminChatListItem[]; total: number; page: number; page_size: number };

export type AdminChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: { title: string; url: string | null }[];
  provider: string | null;
  created_at: string;
};

export type AdminChatDetail = {
  id: string;
  page_url: string | null;
  message_count: number;
  created_at: string;
  last_message_at: string;
  messages: AdminChatMessage[];
  lead: { id: string; name: string | null; status: AdminLeadStatus } | null;
};

export type AiStatus = {
  provider: string;
  is_enabled: boolean;
  used_today: number;
  daily_limit: number;
  source_count: number;
  chunk_count: number;
  sources: { kind: string; count: number }[];
};
