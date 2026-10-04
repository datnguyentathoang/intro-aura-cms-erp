export type Field = {
  name: string; // trùng tên cột trong DB
  label: string;
  type: "text" | "textarea" | "number" | "image" | "checkbox" | "relation";
  required?: boolean;
  relation?: { table: string; labelField: string };
};

export type Resource = {
  title: string;
  fields: Field[];
  listField?: string; // cột hiển thị trong danh sách
  orderBy?: string;
  single?: boolean; // bảng chỉ có 1 dòng (id = 1)
};

const sortAndPublish: Field[] = [
  { name: "sort_order", label: "Thứ tự hiển thị", type: "number" },
  { name: "is_published", label: "Hiển thị trên website", type: "checkbox" },
];

export const RESOURCES: Record<string, Resource> = {
  hero: {
    title: "Banner đầu trang",
    single: true,
    fields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "subtitle", label: "Mô tả ngắn", type: "textarea" },
      { name: "image_url", label: "Ảnh banner", type: "image" },
      { name: "marquee_text", label: "Dòng chữ chạy dưới menu", type: "text" },
      { name: "logo_url", label: "Logo website", type: "image" },
      {
        name: "brand_name",
        label: "Tên thương hiệu (chữ cạnh logo)",
        type: "text",
      },
    ],
  },
  features: {
    title: "Tính năng",
    listField: "title",
    orderBy: "sort_order",
    fields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "image_url", label: "Ảnh", type: "image" },
      ...sortAndPublish,
    ],
  },
  workflows: {
    title: "Luồng nghiệp vụ",
    listField: "title",
    orderBy: "sort_order",
    fields: [
      { name: "title", label: "Tên luồng", type: "text", required: true },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "image_url", label: "Ảnh sơ đồ", type: "image" },
      ...sortAndPublish,
    ],
  },
  workflow_steps: {
    title: "Các bước của luồng",
    listField: "title",
    orderBy: "step_order",
    fields: [
      {
        name: "workflow_id",
        label: "Thuộc luồng",
        type: "relation",
        required: true,
        relation: { table: "workflows", labelField: "title" },
      },
      { name: "step_order", label: "Bước số", type: "number" },
      { name: "title", label: "Tên bước", type: "text", required: true },
      { name: "description", label: "Mô tả", type: "textarea" },
    ],
  },
  screenshots: {
    title: "Ảnh chụp màn hình",
    listField: "caption",
    orderBy: "sort_order",
    fields: [
      { name: "image_url", label: "Ảnh", type: "image", required: true },
      { name: "caption", label: "Chú thích", type: "text" },
      ...sortAndPublish,
    ],
  },
  faqs: {
    title: "Câu hỏi thường gặp",
    listField: "question",
    orderBy: "sort_order",
    fields: [
      { name: "question", label: "Câu hỏi", type: "text", required: true },
      { name: "answer", label: "Trả lời", type: "textarea", required: true },
      ...sortAndPublish,
    ],
  },
  contact_info: {
    title: "Thông tin liên hệ",
    single: true,
    fields: [
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Số điện thoại", type: "text" },
      { name: "address", label: "Địa chỉ", type: "text" },
      { name: "facebook", label: "Link Facebook", type: "text" },
      { name: "zalo", label: "Số Zalo", type: "text" },
    ],
  },
};
