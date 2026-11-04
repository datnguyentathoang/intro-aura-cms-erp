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
  knowledge_documents: {
    title: 'Kiến thức trợ lý',
    api: 'knowledge-documents',
    listField: 'title',
    listSubField: 'content',
    hint: 'Thông tin bổ sung cho trợ lý, ngoài nội dung đã xuất bản trên website. Khách có thể đọc được qua câu trả lời, nên chỉ nhập thông tin được phép công khai.',
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true, maxLength: 200 },
      { name: 'content', label: 'Nội dung', type: 'textarea', required: true, maxLength: 8000, help: 'Viết thành câu rõ ràng, tối đa 8000 ký tự.' },
      { name: 'url', label: 'Đường dẫn để khách đọc thêm', type: 'text', maxLength: 500, help: 'Đường dẫn nội bộ (/pricing) hoặc https://… có thể để trống.' },
      ...sortAndPublish,
    ],
  },
  ai_settings: {
    title: 'Trợ lý AI',
    api: 'ai/settings',
    single: true,
    fields: [
      { name: 'is_enabled', label: 'Bật trợ lý trên website', type: 'checkbox', defaultOff: true },
      { name: 'bot_name', label: 'Tên trợ lý', type: 'text', required: true, maxLength: 60 },
      { name: 'welcome_message', label: 'Lời chào', type: 'textarea', required: true, maxLength: 500 },
      { name: 'fallback_message', label: 'Câu trả lời khi không có thông tin', type: 'textarea', required: true, maxLength: 500, help: 'Sau câu này khách sẽ thấy nút để lại thông tin.' },
      { name: 'daily_message_limit', label: 'Số câu trả lời tối đa mỗi ngày', type: 'number', help: 'Vượt giới hạn thì trợ lý chỉ mời để lại thông tin, không gọi AI. Dùng để kiểm soát chi phí.' },
      { name: 'session_message_limit', label: 'Số câu hỏi tối đa mỗi cuộc trò chuyện', type: 'number' },
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