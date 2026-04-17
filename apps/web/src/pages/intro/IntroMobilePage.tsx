import {
  Images,
  FolderDown,
  Zap,
  Cloud,
  ClipboardPaste,
  List,
  Download,
  FolderCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import DownloadBadge from "../../components/intro/DownloadBadge";
import FeatureCard from "../../components/intro/FeatureCard";
import ScreenshotCarousel from "../../components/intro/ScreenshotCarousel";
import StepCard from "../../components/intro/StepCard";

/**
 * IntroMobilePage——App 介紹頁（`/intro/mobile`）。
 * Hero、features、how-it-works、iOS/Android 截圖、download 五段。
 */
export default function IntroMobilePage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("intro.mobile.docTitle");
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      {/* ===== Hero ===== */}
      <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:gap-12 md:py-16">
        <div className="animate-fade-in-up">
          <h1
            className="mb-4 text-3xl tracking-tight sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {t("intro.mobile.hero.title")}
          </h1>
          <p className="mb-8 text-base leading-relaxed text-[var(--color-on-surface-variant)] md:text-lg">
            {t("intro.mobile.hero.tagline")}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Download size={18} />
              {t("intro.mobile.hero.cta")}
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)] px-6 py-3 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            >
              {t("intro.mobile.hero.learnMore")}
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-2 relative mx-auto w-full max-w-[280px]">
          <div className="overflow-hidden rounded-[2rem] border-8 border-[var(--color-outline)] bg-[var(--color-surface-container)] shadow-[var(--shadow-elevated)]">
            <img
              src={`${import.meta.env.BASE_URL}intro/mobile/blog_input_view_ios_snapshot.png`}
              alt={t("intro.mobile.screenshots.input.title")}
              className="h-auto w-full"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="absolute -right-4 -top-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-soft)]">
            <Smartphone size={22} />
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="py-12 md:py-16">
        <header className="mb-10 text-center">
          <h2
            className="mb-2 text-2xl tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {t("intro.mobile.features.title")}
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] md:text-base">
            {t("intro.mobile.features.subtitle")}
          </p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Images size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.features.batch.title")}
            desc={t("intro.mobile.features.batch.desc")}
          />
          <FeatureCard
            icon={<FolderDown size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.features.gallery.title")}
            desc={t("intro.mobile.features.gallery.desc")}
          />
          <FeatureCard
            icon={<Zap size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.features.cache.title")}
            desc={t("intro.mobile.features.cache.desc")}
          />
          <FeatureCard
            icon={<Cloud size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.features.async.title")}
            desc={t("intro.mobile.features.async.desc")}
          />
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how-it-works" className="py-12 md:py-16">
        <header className="mb-10 text-center">
          <h2
            className="mb-2 text-2xl tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {t("intro.mobile.howItWorks.title")}
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] md:text-base">
            {t("intro.mobile.howItWorks.subtitle")}
          </p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StepCard
            stepNumber={1}
            icon={<ClipboardPaste size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.howItWorks.step1.title")}
            desc={t("intro.mobile.howItWorks.step1.desc")}
          />
          <StepCard
            stepNumber={2}
            icon={<List size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.howItWorks.step2.title")}
            desc={t("intro.mobile.howItWorks.step2.desc")}
          />
          <StepCard
            stepNumber={3}
            icon={<Cloud size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.howItWorks.step3.title")}
            desc={t("intro.mobile.howItWorks.step3.desc")}
          />
          <StepCard
            stepNumber={4}
            icon={<FolderCheck size={22} strokeWidth={1.75} />}
            title={t("intro.mobile.howItWorks.step4.title")}
            desc={t("intro.mobile.howItWorks.step4.desc")}
          />
        </div>
      </section>

      {/* ===== Screenshots ===== */}
      <section id="screenshots" className="py-12 md:py-16">
        <header className="mb-10 text-center">
          <h2
            className="mb-2 text-2xl tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {t("intro.mobile.screenshots.title")}
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] md:text-base">
            {t("intro.mobile.screenshots.subtitle")}
          </p>
        </header>
        <ScreenshotCarousel />
      </section>

      {/* ===== Download ===== */}
      <section id="download" className="py-12 md:py-16">
        <header className="mb-10 text-center">
          <h2
            className="mb-2 text-2xl tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {t("intro.mobile.download.title")}
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] md:text-base">
            {t("intro.mobile.download.subtitle")}
          </p>
        </header>
        <div className="flex flex-wrap justify-center gap-5">
          <DownloadBadge store="appStore" />
          <DownloadBadge store="googlePlay" />
        </div>
      </section>
    </div>
  );
}
