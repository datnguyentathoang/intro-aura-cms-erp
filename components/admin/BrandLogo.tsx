/* eslint-disable @next/next/no-img-element */
export default function BrandLogo({
  logoUrl,
  brand = "Aura",
  size = "md",
  onDark = false,
}: {
  logoUrl?: string | null;
  brand?: string | null;
  size?: "md" | "lg";
  onDark?: boolean;
}) {
  const name = brand || "Aura";

  if (logoUrl) {
    const img = (
      <img
        src={logoUrl}
        alt={name}
        className={`${size === "lg" ? "h-14" : "h-8"} w-auto max-w-[150px] object-contain`}
      />
    );
    return onDark ? (
      <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
        {img}
      </span>
    ) : (
      img
    );
  }

  return (
    <span
      className={`${
        size === "lg" ? "w-14 h-14 text-2xl rounded-xl" : "w-9 h-9 rounded-lg"
      } shrink-0 bg-gradient-to-br from-brand-500 to-accent-600 text-white flex items-center justify-center font-bold`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}