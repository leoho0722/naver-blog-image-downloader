import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OnboardingCard from "../../../components/onboarding/OnboardingCard";

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

  it("renders with title and start button", () => {
    render(<OnboardingCard />);

    expect(screen.getByText("onboardingTitle")).toBeInTheDocument();
    expect(screen.getByText("onboardingStart")).toBeInTheDocument();
    expect(screen.getByText("onboardingDesc")).toBeInTheDocument();
  });

  it("clicking start button calls dismissOnboarding", async () => {
    render(<OnboardingCard />);

    await userEvent.click(screen.getByText("onboardingStart"));
    expect(mockDismissOnboarding).toHaveBeenCalledTimes(1);
  });

  it("pressing Escape calls dismissOnboarding", () => {
    render(<OnboardingCard />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockDismissOnboarding).toHaveBeenCalledTimes(1);
  });

  it("renders with dialog role and aria-modal", () => {
    render(<OnboardingCard />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
