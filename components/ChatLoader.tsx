import { Suspense } from "react";
import { getChatConfig } from "@/lib/api";
import ChatWidget from "@/components/ChatWidget";

async function Loader() {
  const config = await getChatConfig();
  if (!config?.enabled) return null;
  return <ChatWidget botName={config.bot_name} welcome={config.welcome_message} />;
}

// Nằm trong layout gốc để cuộc trò chuyện còn nguyên khi chuyển trang. Suspense: API chậm cũng không làm chậm trang
export default function ChatLoader() {
  return (
    <Suspense fallback={null}>
      <Loader />
    </Suspense>
  );
}
