import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import ThemeLocaleControls from "../layout/ThemeLocaleControls";

export default function IntroNav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  // 捲動時加 shadow，讓 sticky header 與底下內容有層次區隔
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

        <ThemeLocaleControls />
      </div>
    </header>
  );
}
