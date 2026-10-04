"use client";
import { useEffect, useRef } from "react";

export default function HeroVideo({
  src,
  poster,
  speed = 0.5, // tốc độ phát: 1 = bình thường, 0.5 = chậm một nửa
  parallax = 0.3, // độ trôi khi cuộn: 0 = đứng yên, 0.5 = trôi mạnh
  zoom = 0.12, // mức phóng to tối đa khi cuộn hết hero
}: {
  src: string;
  poster?: string;
  speed?: number;
  parallax?: number;
  zoom?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // Phát chậm
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const apply = () => {
      v.playbackRate = speed;
    };
    apply();
    v.addEventListener("loadedmetadata", apply);
    v.addEventListener("play", apply);
    return () => {
      v.removeEventListener("loadedmetadata", apply);
      v.removeEventListener("play", apply);
    };
  }, [speed]);

  // Parallax khi cuộn
  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.parentElement;
    if (!layer || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const h = section.offsetHeight || 1;
      const y = Math.min(window.scrollY, h);
      const shift = y * parallax;
      const scale = 1 + (y / h) * zoom;
      layer.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [parallax, zoom]);

  return (
    <div
      ref={layerRef}
      className="hero-video absolute inset-x-0 -top-[30%] h-[130%] will-change-transform"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}