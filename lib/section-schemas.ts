export type FieldType = "text" | "textarea" | "select" | "checkbox" | "image" | "html" | "lines";
export type Field = {
  name: string; label: string; type: FieldType;
  required?: boolean; help?: string;
  options?: { value: string; label: string }[];
};
export type ListDef = { name: string; label: string; itemLabel: string; max: number; fields: Field[] };
export type SectionSchema = { label: string; description: string; fields: Field[]; lists?: ListDef[] };

const LINK = "Đường dẫn nội bộ (/lien-he), #phan-tu hoặc https://…";

export const SECTION_ORDER = [
  "hero", "feature_grid", "image_text", "rich_text", "testimonials", "pricing", "team", "faq", "cta",
] as const;

export const SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    label: "Banner (Hero)",
    description: "Khối đầu trang nền tối: tiêu đề lớn, mô tả, nút và ảnh.",
    fields: [
      { name: "heading", label: "Tiêu đề", type: "text", required: true },
      { name: "subheading", label: "Mô tả ngắn", type: "textarea" },
      { name: "cta_text", label: "Chữ trên nút", type: "text" },
      { name: "cta_link", label: "Link của nút", type: "text", help: LINK },
      { name: "image_url", label: "Ảnh", type: "image" },
    ],
  },
  feature_grid: {
    label: "Lưới tính năng / dịch vụ",
    description: "Các thẻ có tiêu đề, mô tả và ảnh hoặc biểu tượng.",
    fields: [
      { name: "title", label: "Tiêu đề khối", type: "text" },
      { name: "subtitle", label: "Mô tả khối", type: "textarea" },
    ],
    lists: [{
      name: "items", label: "Các thẻ", itemLabel: "Thẻ", max: 12,
      fields: [
        { name: "title", label: "Tiêu đề", type: "text", required: true },
        { name: "description", label: "Mô tả", type: "textarea" },
        { name: "icon", label: "Biểu tượng", type: "text", help: "Emoji hoặc 1-2 ký tự; bỏ qua nếu dùng ảnh" },
        { name: "image_url", label: "Ảnh", type: "image" },
      ],
    }],
  },
  image_text: {
    label: "Ảnh và văn bản",
    description: "Một ảnh bên cạnh đoạn giới thiệu, có thể kèm nút.",
    fields: [
      { name: "title", label: "Tiêu đề", type: "text" },
      { name: "text", label: "Nội dung", type: "textarea" },
      { name: "image_url", label: "Ảnh", type: "image" },
      {
        name: "image_side", label: "Vị trí ảnh", type: "select",
        options: [{ value: "left", label: "Bên trái" }, { value: "right", label: "Bên phải" }],
      },
      { name: "cta_text", label: "Chữ trên nút", type: "text" },
      { name: "cta_link", label: "Link của nút", type: "text", help: LINK },
    ],
  },
  rich_text: {
    label: "Văn bản (HTML)",
    description: "Bài viết dài có tiêu đề, danh sách, liên kết.",
    fields: [
      { name: "title", label: "Tiêu đề khối", type: "text" },
      { name: "html", label: "Nội dung", type: "html" },
    ],
  },
  testimonials: {
    label: "Đánh giá khách hàng",
    description: "Các trích dẫn của khách hàng. Để trống danh sách để dùng đánh giá chung.",
    fields: [
      { name: "title", label: "Tiêu đề khối", type: "text" },
      { name: "subtitle", label: "Mô tả khối", type: "textarea" },
    ],
    lists: [{
      name: "items", label: "Các đánh giá", itemLabel: "Đánh giá", max: 9,
      fields: [
        { name: "quote", label: "Nội dung đánh giá", type: "textarea", required: true },
        { name: "name", label: "Tên", type: "text", required: true },
        { name: "role", label: "Chức vụ / công ty", type: "text" },
        { name: "avatar_url", label: "Ảnh đại diện", type: "image" },
      ],
    }],
  },
  pricing: {
    label: "Bảng giá",
    description: "Các gói dịch vụ; có thể đánh dấu một gói nổi bật. Để trống danh sách để dùng bảng giá chung.",
    fields: [
      { name: "title", label: "Tiêu đề khối", type: "text" },
      { name: "subtitle", label: "Mô tả khối", type: "textarea" },
    ],
    lists: [{
      name: "plans", label: "Các gói", itemLabel: "Gói", max: 4,
      fields: [
        { name: "name", label: "Tên gói", type: "text", required: true },
        { name: "price", label: "Giá", type: "text", help: "Ví dụ: 9.900.000đ hoặc Liên hệ" },
        { name: "period", label: "Chu kỳ", type: "text", help: "Ví dụ: tháng, năm; có thể để trống" },
        { name: "description", label: "Mô tả", type: "textarea" },
        { name: "features", label: "Quyền lợi", type: "lines", help: "Mỗi dòng một quyền lợi" },
        { name: "highlighted", label: "Gói nổi bật", type: "checkbox" },
        { name: "cta_text", label: "Chữ trên nút", type: "text" },
        { name: "cta_link", label: "Link của nút", type: "text", help: LINK },
      ],
    }],
  },
  team: {
    label: "Đội ngũ",
    description: "Ảnh, tên và chức vụ của các thành viên. Để trống danh sách để dùng đội ngũ chung.",
    fields: [
      { name: "title", label: "Tiêu đề khối", type: "text" },
      { name: "subtitle", label: "Mô tả khối", type: "textarea" },
    ],
    lists: [{
      name: "members", label: "Thành viên", itemLabel: "Thành viên", max: 12,
      fields: [
        { name: "name", label: "Họ tên", type: "text", required: true },
        { name: "role", label: "Chức vụ", type: "text" },
        { name: "bio", label: "Giới thiệu ngắn", type: "textarea" },
        { name: "photo_url", label: "Ảnh", type: "image" },
      ],
    }],
  },
  faq: {
    label: "Câu hỏi thường gặp",
    description: "Danh sách câu hỏi thu gọn.",
    fields: [{ name: "title", label: "Tiêu đề khối", type: "text" }],
    lists: [{
      name: "items", label: "Các câu hỏi", itemLabel: "Câu hỏi", max: 20,
      fields: [
        { name: "question", label: "Câu hỏi", type: "text", required: true },
        { name: "answer", label: "Trả lời", type: "textarea", required: true },
      ],
    }],
  },
  cta: {
    label: "Kêu gọi hành động (CTA)",
    description: "Khối nền màu với một nút lớn.",
    fields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "text", label: "Nội dung", type: "textarea" },
      { name: "button_text", label: "Chữ trên nút", type: "text" },
      { name: "button_link", label: "Link của nút", type: "text", help: LINK },
    ],
  },
};

export function summarize(content: Record<string, unknown>): string {
  for (const k of ["heading", "title", "name", "text"]) {
    const v = content[k];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 90);
  }
  return "(chưa có nội dung)";
}