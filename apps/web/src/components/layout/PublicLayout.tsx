import { Outlet, useMatches } from "react-router-dom";

import type { PublicRouteHandle } from "../../lib/config/public-navigation";
import IntroFooter from "../intro/IntroFooter";
import IntroNav from "../intro/IntroNav";

/**
 * PublicLayout——landing、intro、NotFoundPage 共用的外層 layout。
 * 結構：IntroNav（sticky）+ 主內容 Outlet + IntroFooter。
 * Theme／locale 由 useSettingsStore 管理，不在 layout 內重覆處理。
 */
export default function PublicLayout() {
  const matches = useMatches() as Array<{ handle?: PublicRouteHandle }>;
  const anchorLinks = [...matches].reverse().find((match) => {
    const handle = match.handle;
    return Array.isArray(handle?.anchorLinks) && handle.anchorLinks.length > 0;
  })?.handle?.anchorLinks;

  return (
    <div className="bg-noise flex min-h-screen flex-col">
      <IntroNav anchorLinks={anchorLinks} />
      <main className="relative z-1 flex-1">
        <Outlet />
      </main>
      <IntroFooter />
    </div>
  );
}
