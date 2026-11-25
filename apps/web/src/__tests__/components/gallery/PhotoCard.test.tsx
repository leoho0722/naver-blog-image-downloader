import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PhotoCard from "../../../components/gallery/PhotoCard";
import type { PhotoEntity } from "../../../lib/api/types";

const PHOTO: PhotoEntity = {
  id: "test-1",
  url: "https://img.example.com/1.jpg",
  filename: "1.jpg",
};

function renderCard(
  overrides: Partial<{
    index: number;
    isSelectMode: boolean;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onView: (photo: PhotoEntity) => void;
  }> = {},
) {
  return render(
    <PhotoCard
      photo={PHOTO}
      index={overrides.index ?? 0}
      isSelectMode={overrides.isSelectMode ?? false}
      isSelected={overrides.isSelected ?? false}
      onToggleSelection={overrides.onToggleSelection ?? vi.fn()}
      onView={overrides.onView ?? vi.fn()}
    />,
  );
}

describe("PhotoCard", () => {
  it("calls onView when clicked", async () => {
    const onView = vi.fn();
    renderCard({ onView });

    await userEvent.click(screen.getByRole("button"));
    expect(onView).toHaveBeenCalledWith(PHOTO);
  });

  it("calls onToggleSelection when checkbox overlay is clicked", async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <div className="select-mode">
        <PhotoCard
          photo={PHOTO}
          index={0}
          isSelectMode
          isSelected={false}
          onToggleSelection={onToggle}
          onView={vi.fn()}
        />
      </div>,
    );

    const overlay = container.querySelector(".checkbox-overlay")!;
    await userEvent.click(overlay);
    expect(onToggle).toHaveBeenCalledWith("test-1");
  });

  it("renders image with alt text", () => {
    renderCard();

    expect(screen.getByAltText("1.jpg")).toBeInTheDocument();
  });

  // spectra-scenario: web-photo-gallery / Cross-origin image loading with no referrer
  it("renders image with referrerPolicy no-referrer", () => {
    renderCard();

    const img = screen.getByAltText("1.jpg");
    expect(img).toHaveAttribute("referrerPolicy", "no-referrer");
  });

  // spectra-scenario: web-photo-gallery / Lazy loading of images / loading attributes by grid position
  it.each([
    [1, null, "high"],
    [2, null, null],
    [4, null, null],
    [5, "lazy", null],
    [50, "lazy", null],
  ] as const)(
    "第 %i 張照片：loading=%s、fetchpriority=%s",
    (position, loading, fetchpriority) => {
      renderCard({ index: position - 1 });
      const img = screen.getByAltText("1.jpg");

      if (loading === null) expect(img).not.toHaveAttribute("loading");
      else expect(img).toHaveAttribute("loading", loading);

      if (fetchpriority === null)
        expect(img).not.toHaveAttribute("fetchpriority");
      else expect(img).toHaveAttribute("fetchpriority", fetchpriority);
    },
  );

  // spectra-scenario: web-photo-gallery / Selected card reports pressed state
  it("選取模式下，按鈕以 aria-pressed 反映是否已選取", () => {
    const { rerender } = renderCard({ isSelectMode: true, isSelected: true });
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");

    rerender(
      <PhotoCard
        photo={PHOTO}
        index={0}
        isSelectMode
        isSelected={false}
        onToggleSelection={vi.fn()}
        onView={vi.fn()}
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  // spectra-scenario: web-photo-gallery / No pressed state outside selection mode
  it("非選取模式時不帶 aria-pressed", () => {
    renderCard({ isSelectMode: false, isSelected: true });

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
  });
});
