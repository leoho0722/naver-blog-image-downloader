import { create } from "zustand";

import { checkJobStatus, submitJob } from "../api/photos";
import type { FetchResult, JobStatus, PhotoEntity } from "../api/types";
import { blogId } from "../services/blog-id";
import { isValid, normalize } from "../services/url-validator";

export type FetchPhase =
  | "idle"
  | "submitting"
  | "processing"
  | "completed"
  | "error";

export interface FetchError {
  type:
    | "emptyUrl"
    | "invalidUrl"
    | "timeout"
    | "serverUnavailable"
    | "serverError"
    | "networkError"
    | "unknown";
  message?: string;
}

interface BlogInputState {
  blogUrl: string;
  fetchPhase: FetchPhase;
  error: FetchError | null;
  fetchResult: FetchResult | null;
  jobId: string | null;

  setUrl: (url: string) => void;
  fetchPhotos: () => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 200;

export const useBlogInputStore = create<BlogInputState>((set, get) => ({
  blogUrl: "",
  fetchPhase: "idle",
  error: null,
  fetchResult: null,
  jobId: null,

  setUrl: (url) => set({ blogUrl: url, error: null }),

  fetchPhotos: async () => {
    const { blogUrl } = get();
    const trimmed = blogUrl.trim();

    if (!trimmed) {
      set({ error: { type: "emptyUrl" }, fetchPhase: "error" });
      return;
    }
    if (!isValid(trimmed)) {
      set({ error: { type: "invalidUrl" }, fetchPhase: "error" });
      return;
    }

    const normalizedUrl = normalize(trimmed);
    set({ fetchPhase: "submitting", error: null, fetchResult: null });

    try {
      const jobId = await submitJob(normalizedUrl);
      set({ jobId, fetchPhase: "processing" });

      let attempts = 0;
      while (attempts < MAX_POLL_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        attempts++;

        const status = await checkJobStatus(jobId);
        if (status.status === ("completed" as JobStatus)) {
          const result = status.result;
          if (!result) break;

          const photos: PhotoEntity[] = result.image_urls.map((url, i) => {
            const match = url.match(/\/([^/?]+)\?/);
            const filename = match ? `${i + 1}_${match[1]}` : `${i + 1}.jpg`;
            return { id: `${i}`, url, filename };
          });

          const id = await blogId(normalizedUrl);
          set({
            fetchPhase: "completed",
            fetchResult: {
              photos,
              blogId: id,
              blogUrl: normalizedUrl,
              totalImages: result.total_images,
              failureDownloads: result.failure_downloads,
            },
          });
          return;
        }

        if (status.status === ("failed" as JobStatus)) {
          const errors = status.result?.errors ?? [];
          set({
            fetchPhase: "error",
            error: { type: "serverError", message: errors.join(", ") },
          });
          return;
        }
      }

      set({ fetchPhase: "error", error: { type: "timeout" } });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({ fetchPhase: "error", error: { type: "unknown", message } });
    }
  },

  reset: () =>
    set({
      blogUrl: "",
      fetchPhase: "idle",
      error: null,
      fetchResult: null,
      jobId: null,
    }),
}));
