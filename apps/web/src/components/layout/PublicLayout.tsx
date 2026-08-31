import { Outlet } from "react-router-dom";

import IntroFooter from "../intro/IntroFooter";
import IntroNav from "../intro/IntroNav";

/**
 * PublicLayout——landing、privacy、NotFoundPage 共用的外層 layout。
 * 結構：IntroNav（sticky）+ 主內容 Outlet + IntroFooter。
 * Theme／locale 由 useSettingsStore 管理，不在 layout 內重覆處理。
 */
export default function PublicLayout() {
  return (
    <div className="bg-noise flex min-h-screen flex-col">
      <IntroNav />
      <main className="relative z-1 flex-1">
        <Outlet />
      </main>
      <IntroFooter />
    </div>
  );
}
