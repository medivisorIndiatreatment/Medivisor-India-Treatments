"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

const SCROLL_GAP = 8;

interface StickySidebarProps {
  children: ReactNode;
  topOffset?: number;
  className?: string;
  enableAtWidth?: number;
}

function getHeaderScrollOffset(fallback = 96) {
  const nav = document.querySelector("header nav");
  const height = nav?.getBoundingClientRect().height ?? 0;
  return (height > 0 ? height : fallback) + SCROLL_GAP;
}

export default function StickySidebar({
  children,
  topOffset = 96,
  className = "",
  enableAtWidth = 1024,
}: StickySidebarProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number | null = null;

    const update = () => {
      raf = null;
      const enabled = window.innerWidth >= enableAtWidth;
      if (enabled) {
        const offset = getHeaderScrollOffset(topOffset);
        el.style.top = `${Math.ceil(offset)}px`;
      } else {
        el.style.top = "0px";
      }
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const nav = document.querySelector("header nav");
    const header = document.querySelector("header");

    const mo = new MutationObserver(request);
    if (nav) {
      mo.observe(nav, { attributes: true, attributeFilter: ["class"] });
    }

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(request) : null;
    if (header) {
      ro?.observe(header);
    }
    if (nav) {
      ro?.observe(nav);
    }

    update();

    window.addEventListener("resize", request);
    window.addEventListener("scroll", request, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", request);
      window.removeEventListener("scroll", request);
    };
  }, [topOffset, enableAtWidth]);

  return (
    <aside
      ref={ref}
      className={`lg:sticky lg:self-start ${className}`}
      style={{ top: `${topOffset + SCROLL_GAP}px` }}
    >
      {children}
    </aside>
  );
}
