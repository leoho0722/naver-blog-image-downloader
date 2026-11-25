import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OnboardingCard from "../../../components/onboarding/OnboardingCard";
import { pressEscapeOn } from "../../test-utils/dialog";

const mockDismissOnboarding = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../../lib/stores/use-settings-store", () => ({
  useSettingsStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state = { dismissOnboarding: mockDismissOnboarding };
    return selector ? selector(state) : state;
  },
}));

describe("OnboardingCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with title, three steps and start button", () => {
    render(<OnboardingCard />);

    expect(screen.getByText("onboardingTitle")).toBeInTheDocument();
    expect(screen.getByText("onboardingStart")).toBeInTheDocument();
    expect(screen.getByText("onboardingStep1")).toBeInTheDocument();
    expect(screen.getByText("onboardingStep2")).toBeInTheDocument();
    expect(screen.getByText("onboardingStep3")).toBeInTheDocument();
  });

  it("按「開始使用」會關閉對話框並只記錄一次看過", async () => {
    render(<OnboardingCard />);
    const dialog = screen.getByRole("dialog");

    await userEvent.click(screen.getByText("onboardingStart"));

    expect(dialog).not.toHaveAttribute("open");
    expect(mockDismissOnboarding).toHaveBeenCalledTimes(1);
  });

  // spectra-scenario: web-app-foundation / Escape closes through the native close request
  it("按 Esc 透過原生關閉流程關閉，並只記錄一次看過", () => {
    render(<OnboardingCard />);

    pressEscapeOn(screen.getByRole("dialog") as HTMLDialogElement);

    expect(mockDismissOnboarding).toHaveBeenCalledTimes(1);
  });

  it("以原生 <dialog> 強制回應開啟，不再手動加 role／aria-modal", () => {
    render(<OnboardingCard />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).not.toHaveAttribute("role");
    expect(dialog).not.toHaveAttribute("aria-modal");
  });

  // spectra-scenario: web-app-foundation / Onboarding card focus and heading
  it("打開時焦點在卡片本身，並以 h1 標題命名", () => {
    render(<OnboardingCard />);

    const dialog = screen.getByRole("dialog", { name: "onboardingTitle" });
    expect(dialog).toHaveFocus();
    expect(
      screen.getByRole("heading", { level: 1, name: "onboardingTitle" }),
    ).toBeInTheDocument();
  });
});
