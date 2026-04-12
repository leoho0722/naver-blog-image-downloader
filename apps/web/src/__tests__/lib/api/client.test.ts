import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiPost, ApiError } from "../../../lib/api/client";

beforeEach(() => {
  vi.stubEnv("VITE_API_BASE_URL", "https://test.example.com");
  vi.stubEnv("VITE_API_STAGE", "stage");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("apiPost", () => {
  it("parses dual-layer JSON response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          statusCode: 200,
          body: JSON.stringify({ job_id: "abc123" }),
        }),
        { status: 200 },
      ),
    );

    const { apiPost: freshPost } = await import("../../../lib/api/client");
    const result = await freshPost<{ job_id: string }>("/api/test", {});
    expect(result.job_id).toBe("abc123");
  });

  it("parses flat JSON response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ data: "flat" }), { status: 200 }),
    );

    const result = await apiPost<{ data: string }>("/api/test", {});
    expect(result.data).toBe("flat");
  });

  it("throws ApiError on non-retryable error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Bad Request", { status: 400 }),
    );

    await expect(apiPost("/api/test", {})).rejects.toThrow(ApiError);
  });

  it("retries on 503 then succeeds", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const result = await apiPost<{ ok: boolean }>("/api/test", {});
    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries on 502", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 502 }),
    );

    await expect(apiPost("/api/test", {})).rejects.toThrow(ApiError);
  });
});
