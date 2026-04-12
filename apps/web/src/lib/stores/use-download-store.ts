import { create } from "zustand";

import { checkPackageStatus, requestPackage } from "../api/photos";

export type DownloadPhase = "idle" | "packaging" | "completed" | "error";

interface DownloadState {
  packageId: string | null;
  downloadPhase: DownloadPhase;
  downloadUrl: string | null;
  error: string | null;
  fileCount: number;

  startPackaging: (jobId: string, indices?: number[]) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 200;

export const useDownloadStore = create<DownloadState>((set) => ({
  packageId: null,
  downloadPhase: "idle",
  downloadUrl: null,
  error: null,
  fileCount: 0,

  startPackaging: async (jobId, indices) => {
    set({
      downloadPhase: "packaging",
      error: null,
      downloadUrl: null,
      packageId: null,
    });

    try {
      const response = await requestPackage(jobId, indices);

      if (response.status === "completed" && response.download_url) {
        set({
          packageId: response.package_id,
          downloadPhase: "completed",
          downloadUrl: response.download_url,
          fileCount: response.file_count ?? 0,
        });
        window.location.href = response.download_url;
        return;
      }

      set({ packageId: response.package_id });

      let attempts = 0;
      while (attempts < MAX_POLL_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        attempts++;

        const status = await checkPackageStatus(response.package_id);

        if (status.status === "completed" && status.download_url) {
          set({
            downloadPhase: "completed",
            downloadUrl: status.download_url,
            fileCount: status.file_count ?? 0,
          });
          window.location.href = status.download_url;
          return;
        }

        if (status.status === "failed") {
          set({
            downloadPhase: "error",
            error: status.error ?? "打包失敗",
          });
          return;
        }
      }

      set({ downloadPhase: "error", error: "打包逾時" });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({ downloadPhase: "error", error: message });
    }
  },

  reset: () =>
    set({
      packageId: null,
      downloadPhase: "idle",
      downloadUrl: null,
      error: null,
      fileCount: 0,
    }),
}));
