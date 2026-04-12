import { describe, expect, it } from "vitest";

import { blogId } from "../../../lib/services/blog-id";

describe("blog-id", () => {
  it("returns 16-character hex string", async () => {
    const result = await blogId("https://blog.naver.com/user/12345");
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it("returns same result for same input", async () => {
    const url = "https://blog.naver.com/test/99999";
    const a = await blogId(url);
    const b = await blogId(url);
    expect(a).toBe(b);
  });

  it("returns different result for different input", async () => {
    const a = await blogId("https://blog.naver.com/user/111");
    const b = await blogId("https://blog.naver.com/user/222");
    expect(a).not.toBe(b);
  });
});
