import { useTranslation } from "react-i18next";

import PrivacyPolicySection from "../components/privacy/PrivacyPolicySection";
import {
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_LAST_UPDATED,
} from "../lib/config/privacy-policy";
import { usePageMeta } from "../lib/hooks/use-page-meta";

/**
 * PrivacyPolicyPage——掛於 PublicLayout 下的 `/privacy` 頁面。
 *
 * 版面順序（依 spec web-privacy-policy 要求）：
 *   1. 頁面標題
 *   2. 最後更新日期 / 文件版本（metadata row）
 *   3. 導言段落
 *   4. 內容 sections（由 i18n `privacy.sections` 陣列驅動）
 *   5. 聯絡方式區塊
 */

/** 由 i18n 讀出的單一章節結構，對應 `privacy.sections[]` */
interface PrivacySection {
  id: string;
  title: string;
  body: string | string[];
}

/** 由 i18n 讀出的 contact 區塊結構，對應 `privacy.contact.*` */
interface PrivacyContact {
  title: string;
  body: string;
  email: string;
}

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const pageTitle = t("privacy.pageTitle");
  const metaDescription = t("privacy.metaDescription");

  usePageMeta(pageTitle, metaDescription);

  const sections = t("privacy.sections", { returnObjects: true }) as
    | PrivacySection[]
    | undefined;
  const contact = t("privacy.contact", { returnObjects: true }) as
    | PrivacyContact
    | undefined;

  const version = `v${__APP_VERSION__}`;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header className="mb-10">
        <h1
          className="mb-4 text-3xl tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {pageTitle}
        </h1>
        <dl className="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-[var(--color-on-surface-variant)]">
          <dt className="font-medium">{t("privacy.lastUpdatedLabel")}</dt>
          <dd>{PRIVACY_POLICY_LAST_UPDATED}</dd>
          <dt className="font-medium">{t("privacy.versionLabel")}</dt>
          <dd>{version}</dd>
        </dl>
        <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)] sm:text-base">
          {t("privacy.intro")}
        </p>
      </header>

      <div className="space-y-10">
        {sections?.map((section) => (
          <PrivacyPolicySection
            key={section.id}
            id={section.id}
            title={section.title}
            body={section.body}
          />
        ))}

        {contact && (
          <section
            id="privacy-contact"
            aria-labelledby="privacy-contact-title"
            className="scroll-mt-24 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] p-6"
          >
            <h2
              id="privacy-contact-title"
              className="mb-3 text-xl font-semibold tracking-tight text-[var(--color-on-surface)]"
            >
              {contact.title}
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-[var(--color-on-surface-variant)] sm:text-base">
              {contact.body}
            </p>
            <a
              href={`mailto:${PRIVACY_POLICY_CONTACT_EMAIL}`}
              className="inline-flex items-center font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              {PRIVACY_POLICY_CONTACT_EMAIL}
            </a>
          </section>
        )}
      </div>
    </article>
  );
}
