import { API_BASE_URL } from "../config/api";

export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }

  get isRetryable(): boolean {
    return (
      this.statusCode === 502 ||
      this.statusCode === 503 ||
      this.statusCode === 504
    );
  }
}

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const statusCode = response.status;
        if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
          lastError = new ApiError(`伺服器錯誤（${statusCode}）`, statusCode);
          if (attempt < MAX_RETRIES - 1) {
            await sleep(BACKOFF_BASE_MS * Math.pow(2, attempt));
            continue;
          }
          throw lastError;
        }
        // HTTP 500：後端 failed 狀態回傳結構化 JSON，先嘗試 parse 讓 store 處理
        if (statusCode === 500) {
          try {
            const json = await response.json();
            return parseLambdaProxyResponse<T>(json);
          } catch {
            throw new ApiError(`伺服器錯誤（${statusCode}）`, statusCode);
          }
        }
        const text = await response.text().catch(() => "");
        throw new ApiError(text || `HTTP ${statusCode}`, statusCode);
      }

      const json = await response.json();
      return parseLambdaProxyResponse<T>(json);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("請求逾時");
      }
      if (
        error instanceof ApiError &&
        error.isRetryable &&
        attempt < MAX_RETRIES - 1
      ) {
        lastError = error;
        await sleep(BACKOFF_BASE_MS * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new ApiError("請求失敗");
}

function parseLambdaProxyResponse<T>(json: unknown): T {
  if (
    typeof json === "object" &&
    json !== null &&
    "body" in json &&
    typeof (json as Record<string, unknown>).body === "string"
  ) {
    return JSON.parse((json as Record<string, unknown>).body as string) as T;
  }
  return json as T;
}
