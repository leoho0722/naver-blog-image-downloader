const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STAGE = import.meta.env.VITE_API_STAGE;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL 未設定，請在 .env 中定義");
}

if (!STAGE) {
  throw new Error("VITE_API_STAGE 未設定，請在 .env 中定義");
}

export const API_BASE_URL = `${BASE_URL}/${STAGE}`;
