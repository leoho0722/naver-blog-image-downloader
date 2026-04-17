import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Grid3x3,
  Languages,
  Link2,
  Package,
} from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import FeatureCard from "../../components/intro/FeatureCard";

/**
 * IntroWebPage——Web 版介紹頁（`/intro/web`）。
 * Back link + 標題 + tagline + 四張 feature card + 主 CTA（同站 navigate 到 /app/web）+ 技術棧。
 */
export default function IntroWebPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("intro.web.docTitle");
  }, [t]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        <ArrowLeft size={16} />
        {t("intro.web.back")}
      </Link>

      <section className="mb-12 text-center">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
          <Globe size={32} strokeWidth={1.75} />
        </div>
        <h1
          className="animate-fade-in-up mb-4 text-3xl tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t("intro.web.title")}
        </h1>
        <p className="animate-fade-in-up stagger-1 text-base leading-relaxed text-[var(--color-on-surface-variant)]">
          {t("intro.web.tagline")}
        </p>
      </section>

      <section className="animate-fade-in-up stagger-2 mb-12 grid gap-4">
        <FeatureCard
          icon={<Link2 size={22} strokeWidth={1.75} />}
          title={t("intro.web.featureUrl.title")}
          desc={t("intro.web.featureUrl.desc")}
        />
        <FeatureCard
          icon={<Grid3x3 size={22} strokeWidth={1.75} />}
          title={t("intro.web.featureGrid.title")}
          desc={t("intro.web.featureGrid.desc")}
        />
        <FeatureCard
          icon={<Package size={22} strokeWidth={1.75} />}
          title={t("intro.web.featureBatch.title")}
          desc={t("intro.web.featureBatch.desc")}
        />
        <FeatureCard
          icon={<Languages size={22} strokeWidth={1.75} />}
          title={t("intro.web.featureI18n.title")}
          desc={t("intro.web.featureI18n.desc")}
        />
      </section>

      <section className="mb-12 text-center">
        <Link
          to="/app/web"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-base font-bold text-[var(--color-on-primary)] shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <ExternalLink size={20} />
          {t("intro.web.cta")}
        </Link>
      </section>

      <section className="text-center text-sm text-[var(--color-on-surface-variant)]">
        {t("intro.web.tech")}
      </section>
    </div>
  );
}
