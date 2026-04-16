import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ImageViewer from "../../../components/gallery/ImageViewer";
import type { PhotoEntity } from "../../../lib/api/types";

const PHOTOS: PhotoEntity[] = [
  { id: "0", url: "https://blogfiles.pstatic.net/0.jpg", filename: "0.jpg" },
  { id: "1", url: "https://blogfiles.pstatic.net/1.jpg", filename: "1.jpg" },
];

describe("ImageViewer", () => {
  it("renders image with referrerPolicy no-referrer", () => {
    render(<ImageViewer photos={PHOTOS} initialIndex={0} onClose={vi.fn()} />);

    const img = screen.getByAltText("0.jpg");
    expect(img).toHaveAttribute("referrerPolicy", "no-referrer");
  });
});
