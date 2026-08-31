import {
  ArrowRight,
  Grid3x3,
  Images,
  Languages,
  Link2,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import FeatureCard from "../components/intro/FeatureCard";
import { usePageMeta } from "../lib/hooks/use-page-meta";

/**
 * LandingPage——掛於 PublicLayout 下的根頁面（`/`），是整個專案唯一的對外介紹頁。
 *
 * 版面順序（依 spec web-landing 要求）：
 *   1. Hero：icon + 產品標題 + 雙行 tagline
 *   2. 四張 feature card：貼上網址、照片牆、批次下載、多語系
 *   3. 主 CTA：以同站 <Link> 進入 Web App（`/app`）
 *   4. 技術棧說明
 *
 * 這一頁刻意不放「返回」連結——`/` 已經是最上層，沒有可以回去的父層頁面。
 */
export default function LandingPage() {
  const { t } = useTranslation();

  usePageMeta(t("intro.root.title"));

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <section className="mb-14 text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
          <Images size={40} strokeWidth={1.75} />
        </div>

        <h1
          className="animate-fade-in-up mb-4 text-3xl tracking-tight sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t("intro.root.title")}
        </h1>

        <p className="animate-fade-in-up stagger-1 mx-auto max-w-xl text-base leading-relaxed text-[var(--color-on-surface-variant)] md:text-lg">
          {t("intro.root.taglineLine1")}
          <br />
          {t("intro.root.taglineLine2")}
        </p>
      </section>

      <section className="animate-fade-in-up stagger-2 mb-14 grid gap-4">
        <FeatureCard
          icon={<Link2 size={22} strokeWidth={1.75} />}
          title={t("intro.root.featureUrl.title")}
          desc={t("intro.root.featureUrl.desc")}
        />
        <FeatureCard
          icon={<Grid3x3 size={22} strokeWidth={1.75} />}
          title={t("intro.root.featureGrid.title")}
          desc={t("intro.root.featureGrid.desc")}
        />
        <FeatureCard
          icon={<Package size={22} strokeWidth={1.75} />}
          title={t("intro.root.featureBatch.title")}
          desc={t("intro.root.featureBatch.desc")}
        />
        <FeatureCard
          icon={<Languages size={22} strokeWidth={1.75} />}
          title={t("intro.root.featureI18n.title")}
          desc={t("intro.root.featureI18n.desc")}
        />
      </section>

      <section className="mb-14 text-center">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-base font-bold text-[var(--color-on-primary)] shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          {t("intro.root.cta")}
          <ArrowRight size={20} />
        </Link>
      </section>

      <section className="text-center text-sm text-[var(--color-on-surface-variant)]">
        {t("intro.root.tech")}
      </section>
    </div>
  );
}
