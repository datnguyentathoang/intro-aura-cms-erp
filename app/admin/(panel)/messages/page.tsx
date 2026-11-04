import { redirect } from "next/navigation";

// Tin nhắn liên hệ giờ nằm trong danh sách khách hàng tiềm năng
export default function MessagesPage() {
  redirect("/admin/leads");
}
