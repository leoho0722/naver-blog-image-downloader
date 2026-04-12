import { describe, expect, it } from "vitest";

import { isValid, normalize } from "../../../lib/services/url-validator";

describe("url-validator", () => {
  describe("isValid", () => {
    it("accepts desktop Naver Blog URL", () => {
      expect(isValid("https://blog.naver.com/user/12345")).toBe(true);
    });

    it("accepts mobile Naver Blog URL", () => {
      expect(isValid("https://m.blog.naver.com/user/12345")).toBe(true);
    });

    it("rejects non-Naver URL", () => {
      expect(isValid("https://example.com/page")).toBe(false);
    });

    it("rejects HTTP (non-HTTPS) Naver URL", () => {
      expect(isValid("http://blog.naver.com/user/12345")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValid("")).toBe(false);
    });

    it("rejects plain text", () => {
      expect(isValid("not a url")).toBe(false);
    });
  });

  describe("normalize", () => {
    it("converts mobile URL to desktop", () => {
      expect(normalize("https://m.blog.naver.com/user/12345")).toBe(
        "https://blog.naver.com/user/12345",
      );
    });

    it("keeps desktop URL unchanged", () => {
      const url = "https://blog.naver.com/user/12345";
      expect(normalize(url)).toBe(url);
    });
  });
});
