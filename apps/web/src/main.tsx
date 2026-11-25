import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import "./lib/i18n/config";
import { loadPopoverPolyfillIfNeeded } from "./lib/polyfills/popover";

// 舊瀏覽器缺少原生 Popover API 時才下載 polyfill（不擋住畫面渲染）
void loadPopoverPolyfillIfNeeded();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
