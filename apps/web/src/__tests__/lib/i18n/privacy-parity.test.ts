import { describe, expect, it } from "vitest";

import en from "../../../lib/i18n/messages/en.json";
import ja from "../../../lib/i18n/messages/ja.json";
import ko from "../../../lib/i18n/messages/ko.json";
import zhTW from "../../../lib/i18n/messages/zh-TW.json";

/**
 * Privacy 多語系 key 對齊檢查
 *
 * 目的：隱私政策在四語系之間的 key 結構必須完全一致，
 * 任何語系缺 key 都會讓使用者看到 raw key 或 fallback 語系文字。
 * 另外 sections 陣列的長度與 id 順序必須完全相同，避免跨語系對照錯位。
 */

type Locale = Record<string, unknown>;

function flattenKeys(obj: Locale, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Locale, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function keysUnder(obj: Locale, namespace: string): string[] {
  return flattenKeys(obj).filter(
    (k) => k === namespace || k.startsWith(`${namespace}.`),
  );
}

interface PrivacySection {
  id: string;
  title: string;
  body: string | string[];
}

function getSections(locale: Locale): PrivacySection[] {
  const privacy = locale.privacy as { sections: PrivacySection[] };
  return privacy.sections;
}

describe("i18n privacy 四語系 key 對齊", () => {
  const locales = {
    "zh-TW": zhTW as unknown as Locale,
    en: en as unknown as Locale,
    ja: ja as unknown as Locale,
    ko: ko as unknown as Locale,
  };

  it("privacy namespace 在四語系之間完全一致（忽略 sections 內部 body 陣列差異）", () => {
    // sections 本身是陣列，flattenKeys 會把它當葉節點；
    // 扁平化時會忽略 body 陣列內部差異，這裡只需比對「非 sections 子樹」的 key 集合
    // 以及 contact.* 等物件子樹即可。
    const buildNonSectionKeys = (loc: Locale) =>
      new Set(
        keysUnder(loc, "privacy").filter(
          (k) => !k.startsWith("privacy.sections"),
        ),
      );

    const reference = buildNonSectionKeys(locales["zh-TW"]);
    expect(reference.size).toBeGreaterThan(0);

    for (const [locale, content] of Object.entries(locales)) {
      const current = buildNonSectionKeys(content);
      const missing = [...reference].filter((k) => !current.has(k));
      const extra = [...current].filter((k) => !reference.has(k));

      expect(
        missing,
        `locale "${locale}" 缺少以下 "privacy" key: ${missing.join(", ")}`,
      ).toEqual([]);
      expect(
        extra,
        `locale "${locale}" 多出以下 "privacy" key: ${extra.join(", ")}`,
      ).toEqual([]);
    }
  });

  it("privacy.sections 陣列長度四語系相同", () => {
    const reference = getSections(locales["zh-TW"]).length;
    expect(reference).toBeGreaterThan(0);

    for (const [locale, content] of Object.entries(locales)) {
      const length = getSections(content).length;
      expect(length, `locale "${locale}" sections 長度不符`).toBe(reference);
    }
  });

  it("privacy.sections 各 index 的 id 四語系完全一致", () => {
    const referenceIds = getSections(locales["zh-TW"]).map((s) => s.id);

    for (const [locale, content] of Object.entries(locales)) {
      const ids = getSections(content).map((s) => s.id);
      expect(ids, `locale "${locale}" sections id 順序或值不符 zh-TW`).toEqual(
        referenceIds,
      );
    }
  });

  it("每個 section 都有 title 且 body 為字串或字串陣列", () => {
    for (const [locale, content] of Object.entries(locales)) {
      const sections = getSections(content);
      for (const [index, section] of sections.entries()) {
        expect(
          typeof section.title === "string" && section.title.length > 0,
          `locale "${locale}" sections[${index}] (id=${section.id}) title 不是非空字串`,
        ).toBe(true);

        const bodyValid =
          typeof section.body === "string"
            ? section.body.length > 0
            : Array.isArray(section.body) &&
              section.body.every((p) => typeof p === "string" && p.length > 0);
        expect(
          bodyValid,
          `locale "${locale}" sections[${index}] (id=${section.id}) body 必須為非空字串或非空字串陣列`,
        ).toBe(true);
      }
    }
  });
});
