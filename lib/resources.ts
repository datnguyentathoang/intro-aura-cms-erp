export type Field = {
  name: string // trùng tên cột trong DB
  label: string
  type: 'text' | 'textarea' | 'number' | 'image' | 'checkbox' | 'relation' | 'lines'
  required?: boolean
  relation?: { table: string; labelField: string }
  help?: string // dòng gợi ý dưới ô nhập
  maxLength?: number
  defaultOff?: boolean // checkbox: bản ghi mới không đánh dấu sẵn
}

export type Resource = {
  title: string
  api?: string // đường dẫn trên API: /api/admin/<api>
  fields: Field[]
  listField?: string
  listSubField?: string // dòng phụ trong danh sách
  hint?: string // nội dung này hiện ở đâu trên website
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
  team_members: {
    title: 'Đội ngũ',
    api: 'team-members',
    listField: 'name',
    listSubField: 'role',
    hint: 'Hiện ở những trang có section Đội ngũ để trống danh sách.',
    fields: [
      { name: 'name', label: 'Họ tên', type: 'text', required: true, maxLength: 100 },
      { name: 'role', label: 'Chức vụ', type: 'text', maxLength: 150 },
      { name: 'bio', label: 'Giới thiệu ngắn', type: 'textarea', maxLength: 1000 },
      { name: 'photo_url', label: 'Ảnh', type: 'image' },
      ...sortAndPublish,
    ],
  },
  testimonials: {
    title: 'Đánh giá khách hàng',
    api: 'testimonials',
    listField: 'name',
    listSubField: 'quote',
    hint: 'Hiện trên trang Dự án, trang Bảng giá và những trang có section Đánh giá để trống danh sách.',
    fields: [
      { name: 'quote', label: 'Nội dung đánh giá', type: 'textarea', required: true, maxLength: 1000 },
      { name: 'name', label: 'Tên khách hàng', type: 'text', required: true, maxLength: 100 },
      { name: 'role', label: 'Chức vụ / công ty', type: 'text', maxLength: 150 },
      { name: 'avatar_url', label: 'Ảnh đại diện', type: 'image' },
      ...sortAndPublish,
    ],
  },
  pricing_plans: {
    title: 'Bảng giá',
    api: 'pricing-plans',
    listField: 'name',
    listSubField: 'price',
    hint: 'Hiện trên trang /pricing và những trang có section Bảng giá để trống danh sách.',
    fields: [
      { name: 'name', label: 'Tên gói', type: 'text', required: true, maxLength: 100 },
      { name: 'price', label: 'Giá', type: 'text', maxLength: 40, help: 'Ví dụ: 9.900.000đ hoặc Liên hệ. Để trống sẽ hiện "Liên hệ".' },
      { name: 'period', label: 'Chu kỳ', type: 'text', maxLength: 30, help: 'Ví dụ: tháng, năm; có thể để trống.' },
      { name: 'description', label: 'Mô tả', type: 'textarea', maxLength: 500 },
      { name: 'features', label: 'Quyền lợi', type: 'lines', help: 'Mỗi dòng một quyền lợi, tối đa 20 dòng.' },
      { name: 'highlighted', label: 'Gói nổi bật', type: 'checkbox', defaultOff: true },
      { name: 'cta_text', label: 'Chữ trên nút', type: 'text', maxLength: 50, help: 'Để trống sẽ hiện "Liên hệ tư vấn".' },
      { name: 'cta_link', label: 'Link của nút', type: 'text', maxLength: 500, help: 'Đường dẫn nội bộ (/#contact) hoặc https://… Để trống thì dẫn tới form liên hệ.' },
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