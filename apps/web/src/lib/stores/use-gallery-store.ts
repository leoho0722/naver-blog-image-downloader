import { create } from "zustand";

import type { PhotoEntity } from "../api/types";

interface GalleryState {
  photos: PhotoEntity[];
  blogId: string;
  blogUrl: string;
  jobId: string;
  selectedIds: Set<string>;
  isSelectMode: boolean;

  load: (
    photos: PhotoEntity[],
    blogId: string,
    jobId: string,
    blogUrl?: string,
  ) => void;
  toggleSelectMode: () => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  photos: [],
  blogId: "",
  blogUrl: "",
  jobId: "",
  selectedIds: new Set(),
  isSelectMode: false,

  load: (photos, blogId, jobId, blogUrl = "") =>
    set({
      photos,
      blogId,
      jobId,
      blogUrl,
      selectedIds: new Set(),
      isSelectMode: false,
    }),

  toggleSelectMode: () => {
    const { isSelectMode } = get();
    if (isSelectMode) {
      set({ isSelectMode: false, selectedIds: new Set() });
    } else {
      set({ isSelectMode: true });
    }
  },

  toggleSelection: (id) => {
    const { selectedIds } = get();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ selectedIds: next });
  },

  selectAll: () => {
    const { photos } = get();
    set({ selectedIds: new Set(photos.map((p) => p.id)) });
  },

  clearSelection: () => set({ selectedIds: new Set() }),
}));
