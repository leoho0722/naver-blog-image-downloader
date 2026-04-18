import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import PrivacyPolicyPage from "../../pages/PrivacyPolicyPage";
import { PRIVACY_POLICY_LAST_UPDATED } from "../../lib/config/privacy-policy";

import en from "../../lib/i18n/messages/en.json";
import ja from "../../lib/i18n/messages/ja.json";
import ko from "../../lib/i18n/messages/ko.json";
import zhTW from "../../lib/i18n/messages/zh-TW.json";

import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

/**
 * 建立一份獨立的 i18next 實例，避免污染真實 app 的單例。
 * 這個實例含有四個語系，可透過 changeLanguage 切換後執行斷言。
 */
async function createTestI18n() {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    resources: {
      "zh-TW": { translation: zhTW },
      en: { translation: en },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    lng: "zh-TW",
    fallbackLng: "zh-TW",
    interpolation: { escapeValue: false },
  });
  return instance;
}

describe("PrivacyPolicyPage", () => {
  let previousTitle = "";

  beforeEach(() => {
    previousTitle = document.title;
  });

  afterEach(() => {
    cleanup();
    // 把 document.title 還原成跑測試前的值，避免干擾其他測試
    document.title = previousTitle;
    // 清掉 usePageMeta 新增的 meta description
    document.head
      .querySelectorAll('meta[name="description"]')
      .forEach((el) => el.remove());
  });

  const locales = ["zh-TW", "en", "ja", "ko"] as const;
  const expectedTitles: Record<(typeof locales)[number], string> = {
    "zh-TW": zhTW.privacy.pageTitle,
    en: en.privacy.pageTitle,
    ja: ja.privacy.pageTitle,
    ko: ko.privacy.pageTitle,
  };

  for (const locale of locales) {
    it(`以 ${locale} 語系渲染標題、最後更新、版本、intro、sections 與 contact`, async () => {
      const instance = await createTestI18n();
      await instance.changeLanguage(locale);

      render(
        <I18nextProvider i18n={instance}>
          <PrivacyPolicyPage />
        </I18nextProvider>,
      );

      // 標題（heading）
      expect(
        screen.getByRole("heading", { level: 1, name: expectedTitles[locale] }),
      ).toBeInTheDocument();

      // 最後更新日期（來自常數）
      expect(screen.getByText(PRIVACY_POLICY_LAST_UPDATED)).toBeInTheDocument();

      // 版本字串（來自 __APP_VERSION__，由 vite.config.ts 建置時注入；
      // 在 vitest 環境下也會被 define 設定，並以 package.json 的 version 做值）
      expect(screen.getByText(`v${__APP_VERSION__}`)).toBeInTheDocument();

      // sections：至少每個語系的 zh-TW 參考 id 都該渲染出對應 heading
      const referenceSections = zhTW.privacy.sections;
      for (const section of referenceSections) {
        const sectionEl = document.getElementById(`privacy-${section.id}`);
        expect(
          sectionEl,
          `locale=${locale} 找不到 section id "privacy-${section.id}"`,
        ).not.toBeNull();
      }

      // contact 區塊
      const contactEl = document.getElementById("privacy-contact");
      expect(contactEl).not.toBeNull();
      expect(
        screen.getByRole("link", { name: /leo160918@gmail.com/ }),
      ).toHaveAttribute("href", "mailto:leo160918@gmail.com");

      // document.title 在 mount 後應變成該語系的 pageTitle
      expect(document.title).toBe(expectedTitles[locale]);
    });
  }

  it("unmount 後 document.title 還原為先前的值", async () => {
    const instance = await createTestI18n();
    document.title = "PREVIOUS_TITLE";

    const { unmount } = render(
      <I18nextProvider i18n={instance}>
        <PrivacyPolicyPage />
      </I18nextProvider>,
    );

    expect(document.title).toBe(zhTW.privacy.pageTitle);

    unmount();

    expect(document.title).toBe("PREVIOUS_TITLE");
  });

  it("meta description 會在掛載後寫入 document.head", async () => {
    const instance = await createTestI18n();

    render(
      <I18nextProvider i18n={instance}>
        <PrivacyPolicyPage />
      </I18nextProvider>,
    );

    const meta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    expect(meta).not.toBeNull();
    expect(meta?.content).toBe(zhTW.privacy.metaDescription);
  });
});
