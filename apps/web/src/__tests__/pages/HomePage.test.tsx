import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "../../pages/HomePage";
import type { FetchResult } from "../../lib/api/types";
import { useBlogInputStore } from "../../lib/stores/use-blog-input-store";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../lib/hooks/use-clipboard", () => ({
  useClipboard: () => {},
}));

vi.mock("../../components/blog-input/BlogInputForm", () => ({
  default: () => <div data-testid="blog-input-form" />,
}));

vi.mock("../../components/blog-input/FetchProgress", () => ({
  default: () => <div data-testid="fetch-progress" />,
}));

vi.mock("../../components/onboarding/OnboardingCard", () => ({
  default: () => <div data-testid="onboarding-card" />,
}));

let mockHasSeenOnboarding = true;
vi.mock("../../lib/stores/use-settings-store", () => ({
  useSettingsStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state = { hasSeenOnboarding: mockHasSeenOnboarding };
    return selector ? selector(state) : state;
  },
}));

const FETCH_RESULT: FetchResult = {
  photos: [{ id: "0", url: "https://img/0.jpg", filename: "0.jpg" }],
  blogId: "abc123",
  blogUrl: "https://blog.naver.com/test",
  totalImages: 1,
  failureDownloads: 0,
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasSeenOnboarding = true;
    useBlogInputStore.setState({
      blogUrl: "",
      fetchPhase: "idle",
      error: null,
      fetchResult: null,
      jobId: null,
    });
  });

  it("fetchPhase 為 completed 且 fetchResult 存在時，導航到 gallery 並傳入正確 state", () => {
    render(<HomePage />);

    // 模擬 fetch 完成，用 act 確保 React effect 執行
    act(() => {
      useBlogInputStore.setState({
        fetchPhase: "completed",
        fetchResult: FETCH_RESULT,
        jobId: "job-001",
      });
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/gallery/abc123", {
      state: { fetchResult: FETCH_RESULT, jobId: "job-001" },
    });
  });

  it("navigate 後 store 被 reset", () => {
    render(<HomePage />);

    act(() => {
      useBlogInputStore.setState({
        fetchPhase: "completed",
        fetchResult: FETCH_RESULT,
        jobId: "job-001",
        blogUrl: "https://blog.naver.com/test",
      });
    });

    // reset 應在 navigate 之後執行，store 回到 idle
    const state = useBlogInputStore.getState();
    expect(state.fetchPhase).toBe("idle");
    expect(state.blogUrl).toBe("");
    expect(state.fetchResult).toBeNull();
    expect(state.jobId).toBeNull();
  });

  it("fetchPhase 非 completed 時不導航", () => {
    render(<HomePage />);

    act(() => {
      useBlogInputStore.setState({ fetchPhase: "processing" });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("首次造訪時顯示 onboarding card", () => {
    mockHasSeenOnboarding = false;
    render(<HomePage />);

    expect(screen.getByTestId("onboarding-card")).toBeInTheDocument();
  });

  it("已看過教學時不顯示 onboarding card", () => {
    mockHasSeenOnboarding = true;
    render(<HomePage />);

    expect(screen.queryByTestId("onboarding-card")).not.toBeInTheDocument();
  });
});
