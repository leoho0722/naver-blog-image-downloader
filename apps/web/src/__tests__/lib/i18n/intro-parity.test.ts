import { describe, expect, it } from "vitest";

import en from "../../../lib/i18n/messages/en.json";
import ja from "../../../lib/i18n/messages/ja.json";
import ko from "../../../lib/i18n/messages/ko.json";
import zhTW from "../../../lib/i18n/messages/zh-TW.json";

/**
 * Intro 與 NotFound 多語系 key 對齊檢查
 *
 * 目的：landing / intro 頁在四語系之間必須 key 結構一致，
 * 任何一個語系缺 key 都會讓使用者看到 raw key 或 fallback 語系文字。
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

const NAMESPACES = ["intro", "notFound"] as const;

describe("i18n intro / notFound 四語系 key 對齊", () => {
  const locales = {
    "zh-TW": zhTW as Locale,
    en: en as Locale,
    ja: ja as Locale,
    ko: ko as Locale,
  };

  for (const ns of NAMESPACES) {
    it(`"${ns}" namespace 在四語系之間完全一致`, () => {
      const reference = new Set(keysUnder(locales["zh-TW"], ns));
      expect(reference.size).toBeGreaterThan(0);

      for (const [locale, content] of Object.entries(locales)) {
        const current = new Set(keysUnder(content, ns));
        const missing = [...reference].filter((k) => !current.has(k));
        const extra = [...current].filter((k) => !reference.has(k));

        expect(
          missing,
          `locale "${locale}" 缺少以下 "${ns}" key: ${missing.join(", ")}`,
        ).toEqual([]);
        expect(
          extra,
          `locale "${locale}" 多出以下 "${ns}" key: ${extra.join(", ")}`,
        ).toEqual([]);
      }
    });
  }

  it("intro.mobile.screenshots 的 tab 鍵完整（iOS / Android）", () => {
    for (const [locale, content] of Object.entries(locales)) {
      const keys = new Set(
        keysUnder(content, "intro.mobile.screenshots.tabIos"),
      );
      expect(
        keys.has("intro.mobile.screenshots.tabIos"),
        `locale "${locale}" 缺少 tabIos`,
      ).toBe(true);

      const androidKeys = new Set(
        keysUnder(content, "intro.mobile.screenshots.tabAndroid"),
      );
      expect(
        androidKeys.has("intro.mobile.screenshots.tabAndroid"),
        `locale "${locale}" 缺少 tabAndroid`,
      ).toBe(true);
    }
  });
});
