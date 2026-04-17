import { Images, Smartphone, Monitor, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/**
 * IntroRootPage——根 landing 頁（`/`）。
 * Hero icon + 標題 + tagline + 兩張卡片導向 /intro/mobile 與 /intro/web。
 */
export default function IntroRootPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("intro.root.title");
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 text-center md:py-24">
      <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
        <Images size={40} strokeWidth={1.75} />
      </div>

      <h1
        className="animate-fade-in-up mb-4 text-3xl tracking-tight sm:text-4xl md:text-5xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        {t("intro.root.title")}
      </h1>

      <p className="animate-fade-in-up stagger-1 mx-auto mb-12 max-w-xl text-base leading-relaxed text-[var(--color-on-surface-variant)] md:text-lg">
        {t("intro.root.taglineLine1")}
        <br />
        {t("intro.root.taglineLine2")}
      </p>

      <div className="animate-fade-in-up stagger-2 grid gap-5 md:grid-cols-2">
        <Link
          to="/intro/mobile"
          className="group flex flex-col items-center gap-3 rounded-3xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] p-8 text-left shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="mb-1 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
            <Smartphone size={28} strokeWidth={1.75} />
          </div>
          <div
            className="text-lg font-bold text-[var(--color-on-surface)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("intro.root.cardAppTitle")}
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
            {t("intro.root.cardAppDesc")}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1">
            <span>{t("intro.root.cardLearnMore")}</span>
            <ChevronRight size={16} />
          </div>
        </Link>

        <Link
          to="/intro/web"
          className="group flex flex-col items-center gap-3 rounded-3xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] p-8 text-left shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="mb-1 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
            <Monitor size={28} strokeWidth={1.75} />
          </div>
          <div
            className="text-lg font-bold text-[var(--color-on-surface)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("intro.root.cardWebTitle")}
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
            {t("intro.root.cardWebDesc")}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1">
            <span>{t("intro.root.cardLearnMore")}</span>
            <ChevronRight size={16} />
          </div>
        </Link>
      </div>
    </div>
  );
}
