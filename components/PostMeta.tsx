import { formatPostDate } from "@/lib/blog";

// Dòng thông tin bài viết: tác giả, ngày đăng, thời gian đọc
export default function PostMeta({
  author,
  publishedAt,
  readMinutes,
}: {
  author?: string | null;
  publishedAt: string | null;
  readMinutes: number;
}) {
  const date = formatPostDate(publishedAt);
  return (
    <p className="flex flex-wrap gap-x-2 text-sm text-gray-600 tabular-nums min-w-0 [overflow-wrap:anywhere]">
      {author && <span>{author}</span>}
      {author && date && <span aria-hidden="true">·</span>}
      {date && <time dateTime={publishedAt ?? undefined}>{date}</time>}
      {(author || date) && <span aria-hidden="true">·</span>}
      <span>{readMinutes} phút đọc</span>
    </p>
  );
}
