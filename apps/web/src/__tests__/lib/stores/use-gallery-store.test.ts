import { beforeEach, describe, expect, it } from "vitest";

import type { PhotoEntity } from "../../../lib/api/types";
import { useGalleryStore } from "../../../lib/stores/use-gallery-store";

const PHOTOS: PhotoEntity[] = [
  { id: "0", url: "https://img/0.jpg", filename: "0.jpg" },
  { id: "1", url: "https://img/1.jpg", filename: "1.jpg" },
  { id: "2", url: "https://img/2.jpg", filename: "2.jpg" },
];

describe("use-gallery-store", () => {
  beforeEach(() => {
    useGalleryStore.getState().load([], "", "");
  });

  it("loads photos", () => {
    useGalleryStore.getState().load(PHOTOS, "blog123", "job456");
    const state = useGalleryStore.getState();
    expect(state.photos).toHaveLength(3);
    expect(state.blogId).toBe("blog123");
    expect(state.isSelectMode).toBe(false);
  });

  it("toggles selection mode", () => {
    useGalleryStore.getState().load(PHOTOS, "b", "j");
    useGalleryStore.getState().toggleSelectMode();
    expect(useGalleryStore.getState().isSelectMode).toBe(true);

    useGalleryStore.getState().toggleSelectMode();
    expect(useGalleryStore.getState().isSelectMode).toBe(false);
    expect(useGalleryStore.getState().selectedIds.size).toBe(0);
  });

  it("toggles individual selection", () => {
    useGalleryStore.getState().load(PHOTOS, "b", "j");
    useGalleryStore.getState().toggleSelection("1");
    expect(useGalleryStore.getState().selectedIds.has("1")).toBe(true);

    useGalleryStore.getState().toggleSelection("1");
    expect(useGalleryStore.getState().selectedIds.has("1")).toBe(false);
  });

  it("selects all", () => {
    useGalleryStore.getState().load(PHOTOS, "b", "j");
    useGalleryStore.getState().selectAll();
    expect(useGalleryStore.getState().selectedIds.size).toBe(3);
  });

  it("clears selection", () => {
    useGalleryStore.getState().load(PHOTOS, "b", "j");
    useGalleryStore.getState().selectAll();
    useGalleryStore.getState().clearSelection();
    expect(useGalleryStore.getState().selectedIds.size).toBe(0);
  });
});
