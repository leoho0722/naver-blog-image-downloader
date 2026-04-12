import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import "./lib/i18n/config";

const ICONS = ["/icons/icon_default.png", "/icons/icon_new.png"];
const link = document.getElementById("favicon") as HTMLLinkElement | null;
if (link) {
  link.href = ICONS[Math.floor(Math.random() * ICONS.length)];
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
