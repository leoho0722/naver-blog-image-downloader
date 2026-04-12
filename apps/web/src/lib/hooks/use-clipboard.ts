import { useCallback, useEffect, useRef } from "react";

import { isValid } from "../services/url-validator";

interface UseClipboardOptions {
  onNaverUrlDetected: (url: string) => void;
  enabled?: boolean;
}

export function useClipboard({
  onNaverUrlDetected,
  enabled = true,
}: UseClipboardOptions) {
  const lastDetectedRef = useRef("");

  const checkClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (trimmed && isValid(trimmed) && trimmed !== lastDetectedRef.current) {
        lastDetectedRef.current = trimmed;
        onNaverUrlDetected(trimmed);
      }
    } catch {
      // 使用者未授權剪貼簿權限
    }
  }, [onNaverUrlDetected]);

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      checkClipboard();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, checkClipboard]);
}
