// Chuyển tiêu đề tiếng Việt thành slug: chữ thường không dấu, số và dấu gạch ngang
export function slugify(s: string, max = 80) {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, max).replace(/-+$/, "");
}
