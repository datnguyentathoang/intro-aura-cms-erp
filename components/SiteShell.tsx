// components/SiteShell.tsx
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getHomeSafe, getMenu } from "@/lib/api";

// Khung chung cho các trang động: thanh menu, nội dung, chân trang.
// darkTop = true khi section đầu tiên là hero tối (menu trong suốt ở đầu trang).
export default async function SiteShell({
  children,
  darkTop = false,
}: {
  children: React.ReactNode;
  darkTop?: boolean;
}) {
  const [home, menu] = await Promise.all([getHomeSafe(), getMenu()]);
  const h = home?.hero;
  const marquee = h?.marquee_text ?? undefined;

  return (
    <>
      <Navbar
        brand={h?.brand_name ?? undefined}
        logoUrl={h?.logo_url ?? undefined}
        marquee={marquee}
        menu={menu}
        forceSolid={!darkTop}
      />
      <main className={darkTop ? "" : marquee ? "pt-28 md:pt-32" : "pt-20 md:pt-24"}>{children}</main>
      <SiteFooter brand={h?.brand_name} />
    </>
  );
}