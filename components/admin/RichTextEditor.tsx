"use client";
import { useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

type Upload = (form: FormData) => Promise<{ url?: string; error?: string }>;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const LINK = /^(https?:\/\/|\/(?!\/)|#)\S*$/i;

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${
        active ? "bg-brand-100 text-brand-800" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-gray-200" aria-hidden="true" />;
}

function Toolbar({
  editor,
  uploading,
  onLink,
  onPickImage,
}: {
  editor: Editor;
  uploading: boolean;
  onLink: () => void;
  onPickImage: () => void;
}) {
  // Tiptap 3 không tự vẽ lại khi con trỏ di chuyển: đọc trạng thái nút qua useEditorState
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Định dạng nội dung"
      className="sticky top-14 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-gray-200 bg-white p-2 lg:top-0"
    >
      <ToolButton label="In đậm" active={s.bold} onClick={() => chain().toggleBold().run()}>B</ToolButton>
      <ToolButton label="In nghiêng" active={s.italic} onClick={() => chain().toggleItalic().run()}><span className="italic">I</span></ToolButton>
      <ToolButton label="Gạch chân" active={s.underline} onClick={() => chain().toggleUnderline().run()}><span className="underline">U</span></ToolButton>
      <Divider />
      <ToolButton label="Tiêu đề lớn" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>H2</ToolButton>
      <ToolButton label="Tiêu đề nhỏ" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>H3</ToolButton>
      <Divider />
      <ToolButton label="Danh sách dấu chấm" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>
        <Icon d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
      </ToolButton>
      <ToolButton label="Danh sách đánh số" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <Icon d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M4 14.5c.4-.8 2.5-.9 2.5.5 0 1.200-2.500 2-2.500 3.500h2.500" />
      </ToolButton>
      <ToolButton label="Trích dẫn" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
        <Icon d="M5 5v14M10 8h9M10 12h9M10 16h6" />
      </ToolButton>
      <Divider />
      <ToolButton label="Chèn liên kết" active={s.link} onClick={onLink}>
        <Icon d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.700l-1 1M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1" />
      </ToolButton>
      <ToolButton label={uploading ? "Đang tải ảnh" : "Chèn ảnh"} disabled={uploading} onClick={onPickImage}>
        <Icon d="M4 5h16v14H4V5zm0 11l5-5 4 4 2-2 5 5M15 9h.01" />
      </ToolButton>
      <Divider />
      <ToolButton label="Hoàn tác" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        <Icon d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />
      </ToolButton>
      <ToolButton label="Làm lại" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        <Icon d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3" />
      </ToolButton>
    </div>
  );
}

// Giá trị HTML nằm trong input ẩn (name) để gửi cùng form. API lọc lại HTML khi lưu.
export default function RichTextEditor({
  name,
  value,
  upload,
  onChange,
}: {
  name: string;
  value: string;
  upload: Upload;
  onChange?: () => void;
}) {
  const [html, setHtml] = useState(value);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    // Bắt buộc khi có SSR: chỉ tạo editor sau khi vào trình duyệt, tránh lệch nội dung lúc hydrate
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, HTMLAttributes: { target: null, rel: null, class: null } },
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rich-text min-h-96 p-4 focus:outline-none",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Nội dung bài viết",
      },
    },
    onUpdate: ({ editor: e }) => {
      // Editor luôn giữ một đoạn trống ở cuối để đặt con trỏ, không lưu đoạn đó
      setHtml(e.isEmpty ? "" : e.getHTML().replace(/(<p><\/p>)+$/, ""));
      onChange?.();
    },
  });

  function setLink() {
    if (!editor) return;
    setNotice("");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      setNotice("Hãy bôi đen đoạn chữ cần gắn liên kết trước.");
      return;
    }
    const url = window.prompt("Nhập liên kết (để trống để gỡ). Ví dụ: https://... hoặc /blog", editor.getAttributes("link").href ?? "");
    if (url === null) return;
    const clean = url.trim();
    if (!clean) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Chỉ nhận loại liên kết mà bộ lọc HTML của API giữ lại: nó xoá mailto: và tel:
    if (!LINK.test(clean)) {
      setNotice("Liên kết phải bắt đầu bằng https://, http://, / hoặc # và không có khoảng trắng.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: clean }).run();
  }

  async function insertImage(file: File) {
    if (!editor) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setNotice("Ảnh tối đa 4MB.");
      return;
    }
    setNotice("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await upload(form);
      if (!result.url) {
        setNotice(result.error ?? "Tải ảnh thất bại.");
        return;
      }
      const alt = window.prompt("Mô tả ngắn cho ảnh (giúp SEO và người khiếm thị, có thể để trống):", "") ?? "";
      editor.chain().focus().setImage({ src: result.url, alt: alt.trim() }).run();
    } catch {
      setNotice("Tải ảnh thất bại. Ảnh có thể quá lớn, hãy thử ảnh nhỏ hơn.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="rounded-xl border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-brand-500">
        {editor ? (
          <Toolbar editor={editor} uploading={uploading} onLink={setLink} onPickImage={() => fileRef.current?.click()} />
        ) : (
          <div className="h-[53px] rounded-t-xl border-b border-gray-200" aria-hidden="true" />
        )}
        {editor ? <EditorContent editor={editor} /> : <div className="min-h-96 p-4 text-gray-600">Đang tải trình soạn thảo...</div>}
      </div>
      <input type="hidden" name={name} value={html} />
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void insertImage(file);
        }}
      />
      <p className="mt-2 min-h-5 text-sm font-normal text-red-700" role="status">{notice}</p>
    </div>
  );
}
