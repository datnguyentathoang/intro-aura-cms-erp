export type Field = {
  name: string // trùng tên cột trong DB
  label: string
  type: 'text' | 'textarea' | 'number' | 'image' | 'checkbox' | 'relation'
  required?: boolean
  relation?: { table: string; labelField: string }
}

export type Resource = {
  title: string
  api?: string // đường dẫn trên API: /api/admin/<api>
  fields: Field[]
  listField?: string
  orderBy?: string
  single?: boolean // bảng chỉ có 1 dòng
}

const sortAndPublish: Field[] = [
  { name: 'sort_order', label: 'Thứ tự hiển thị', type: 'number' },
  { name: 'is_published', label: 'Hiển thị trên website', type: 'checkbox' },
]

export const RESOURCES: Record<string, Resource> = {
  hero: {
    title: 'Banner đầu trang',
    api: 'hero',
    single: true,
    fields: [
      { name: 'logo_url', label: 'Logo website', type: 'image' },
      { name: 'brand_name', label: 'Tên thương hiệu (chữ cạnh logo)', type: 'text' },
      { name: 'marquee_text', label: 'Dòng chữ chạy dưới menu', type: 'text' },
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { name: 'subtitle', label: 'Mô tả ngắn', type: 'textarea' },
      { name: 'image_url', label: 'Ảnh banner', type: 'image' },
    ],
  },
  features: {
    title: 'Tính năng',
    api: 'features',
    listField: 'title',
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
      { name: 'image_url', label: 'Ảnh', type: 'image' },
      ...sortAndPublish,
    ],
  },
  workflows: {
    title: 'Luồng nghiệp vụ',
    api: 'workflows',
    listField: 'title',
    fields: [
      { name: 'title', label: 'Tên luồng', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
      { name: 'image_url', label: 'Ảnh sơ đồ', type: 'image' },
      ...sortAndPublish,
    ],
  },
  workflow_steps: {
    title: 'Các bước của luồng',
    listField: 'title',
    fields: [
      { name: 'step_order', label: 'Bước số', type: 'number' },
      { name: 'title', label: 'Tên bước', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
  },
  screenshots: {
    title: 'Ảnh chụp màn hình',
    api: 'screenshots',
    listField: 'caption',
    fields: [
      { name: 'image_url', label: 'Ảnh', type: 'image', required: true },
      { name: 'caption', label: 'Chú thích', type: 'text' },
      ...sortAndPublish,
    ],
  },
  faqs: {
    title: 'Câu hỏi thường gặp',
    api: 'faqs',
    listField: 'question',
    fields: [
      { name: 'question', label: 'Câu hỏi', type: 'text', required: true },
      { name: 'answer', label: 'Trả lời', type: 'textarea', required: true },
      ...sortAndPublish,
    ],
  },
  contact_info: {
    title: 'Thông tin liên hệ',
    api: 'contact-info',
    single: true,
    fields: [
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Số điện thoại', type: 'text' },
      { name: 'address', label: 'Địa chỉ', type: 'text' },
      { name: 'facebook', label: 'Link Facebook', type: 'text' },
      { name: 'zalo', label: 'Số Zalo', type: 'text' },
    ],
  },
}