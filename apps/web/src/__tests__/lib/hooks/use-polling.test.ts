import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePolling } from "../../../lib/hooks/use-polling";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("use-polling", () => {
  it("does not poll when disabled", () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const onResult = vi.fn().mockReturnValue(false);

    renderHook(() =>
      usePolling({ fn, onResult, enabled: false, interval: 100 }),
    );

    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  it("stops polling when onResult returns true", async () => {
    const fn = vi.fn().mockResolvedValue("done");
    const onResult = vi.fn().mockReturnValue(true);

    renderHook(() =>
      usePolling({ fn, onResult, enabled: true, interval: 100 }),
    );

    await vi.advanceTimersByTimeAsync(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith("done");

    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cleans up on unmount", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const onResult = vi.fn().mockReturnValue(false);

    const { unmount } = renderHook(() =>
      usePolling({ fn, onResult, enabled: true, interval: 100 }),
    );

    await vi.advanceTimersByTimeAsync(50);
    expect(fn).toHaveBeenCalledTimes(1);

    unmount();

    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls onMaxAttemptsReached when limit hit", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const onResult = vi.fn().mockReturnValue(false);
    const onMax = vi.fn();

    renderHook(() =>
      usePolling({
        fn,
        onResult,
        enabled: true,
        interval: 10,
        maxAttempts: 3,
        onMaxAttemptsReached: onMax,
      }),
    );

    for (let i = 0; i < 5; i++) {
      await vi.advanceTimersByTimeAsync(15);
    }

    expect(fn).toHaveBeenCalledTimes(3);
    expect(onMax).toHaveBeenCalledTimes(1);
  });
});
