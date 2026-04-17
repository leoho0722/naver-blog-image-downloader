import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { AnchorLink } from "../../lib/config/public-navigation";
import ThemeLocaleControls from "../layout/ThemeLocaleControls";

interface Props {
  /** 若提供，渲染在品牌旁邊的頁內錨點 */
  anchorLinks?: AnchorLink[];
}

export default function IntroNav({ anchorLinks }: Props) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  // 捲動時加 shadow，與原 docs/mobile 視覺一致
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-10 backdrop-blur transition-shadow duration-200 ${
        scrolled
          ? "shadow-[var(--shadow-soft)] bg-[var(--color-surface)]/90"
          : "bg-[var(--color-surface)]/60"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
        <Link
          to="/"
          className="mr-auto text-lg tracking-tight"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
          }}
        >
          {t("appTitle")}
        </Link>

        {anchorLinks && anchorLinks.length > 0 && (
          <nav className="hidden items-center gap-1 md:flex">
            {anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        )}
        <ThemeLocaleControls />
      </div>
    </header>
  );
}
