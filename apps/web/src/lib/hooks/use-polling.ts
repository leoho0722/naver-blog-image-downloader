import { useCallback, useEffect, useRef } from "react";

interface UsePollingOptions<T> {
  fn: (signal: AbortSignal) => Promise<T>;
  onResult: (result: T) => boolean;
  interval?: number;
  maxAttempts?: number;
  enabled?: boolean;
  onMaxAttemptsReached?: () => void;
}

export function usePolling<T>({
  fn,
  onResult,
  interval = 3000,
  maxAttempts = 200,
  enabled = false,
  onMaxAttemptsReached,
}: UsePollingOptions<T>) {
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    abortRef.current?.abort("polling stopped");
    attemptsRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (attemptsRef.current >= maxAttempts) {
        onMaxAttemptsReached?.();
        return;
      }

      attemptsRef.current++;
      abortRef.current = new AbortController();

      try {
        const result = await fn(abortRef.current.signal);
        if (cancelled) return;
        const shouldStop = onResult(result);
        if (shouldStop) return;
      } catch {
        if (cancelled) return;
      }

      timerRef.current = setTimeout(poll, interval);
    };

    poll();

    return () => {
      cancelled = true;
      stop();
    };
  }, [
    enabled,
    fn,
    onResult,
    interval,
    maxAttempts,
    onMaxAttemptsReached,
    stop,
  ]);

  return { stop };
}
