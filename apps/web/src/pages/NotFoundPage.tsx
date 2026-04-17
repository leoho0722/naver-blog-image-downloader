import { Home, MapPinOff, Monitor, Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * NotFoundPage——一等 404 頁面，套用 PublicLayout 視覺：
 * hero 大號 404 + icon + 主副標 + 三個 CTA（回首頁、前往 Web 版、看 App 介紹）。
 * 響應式：行動版 CTA 堆疊、桌面並排。
 */
export default function NotFoundPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `404 — ${t("intro.root.title")}`;
  }, [t]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="relative mb-6 inline-flex items-center justify-center">
        <span
          className="text-[120px] leading-none text-[var(--color-outline-variant)] sm:text-[160px]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          aria-hidden
        >
          404
        </span>
        <MapPinOff
          size={56}
          strokeWidth={1.5}
          className="absolute -right-6 -top-2 text-[var(--color-primary)]"
        />
      </div>

      <h1
        className="mb-3 text-2xl tracking-tight sm:text-3xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        {t("notFound.title")}
      </h1>
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-[var(--color-on-surface-variant)] sm:text-base">
        {t("notFound.desc")}
      </p>

      <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Home size={18} />
          {t("notFound.ctaHome")}
        </Link>
        <Link
          to="/app/web"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-outline-variant)] px-6 py-3 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
        >
          <Monitor size={18} />
          {t("notFound.ctaWebApp")}
        </Link>
        <Link
          to="/intro/mobile"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-outline-variant)] px-6 py-3 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
        >
          <Smartphone size={18} />
          {t("notFound.ctaMobileIntro")}
        </Link>
      </div>
    </div>
  );
}
