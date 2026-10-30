// components/SiteFooter.tsx
export default function SiteFooter({ brand }: { brand?: string | null }) {
  return (
    <footer className="bg-stone-900 text-stone-400 text-sm text-center py-8">
      © {new Date().getFullYear()} {brand || "Aura ERP"}. Giải pháp quản lý kho & bán hàng.
    </footer>
  );
}