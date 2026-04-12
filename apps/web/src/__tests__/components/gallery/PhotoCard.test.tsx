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

describe("PhotoCard", () => {
  it("calls onView when clicked", async () => {
    const onView = vi.fn();
    render(
      <PhotoCard
        photo={PHOTO}
        isSelected={false}
        onToggleSelection={vi.fn()}
        onView={onView}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(onView).toHaveBeenCalledWith(PHOTO);
  });

  it("calls onToggleSelection when checkbox overlay is clicked", async () => {
    const onToggle = vi.fn();
    const { container } = render(
      <div className="select-mode">
        <PhotoCard
          photo={PHOTO}
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
    render(
      <PhotoCard
        photo={PHOTO}
        isSelected={false}
        onToggleSelection={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByAltText("1.jpg")).toBeInTheDocument();
  });
});
