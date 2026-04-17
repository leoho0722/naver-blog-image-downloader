import { Outlet } from "react-router-dom";

import IntroFooter from "../intro/IntroFooter";
import IntroNav, { type AnchorLink } from "../intro/IntroNav";

interface Props {
  /** 若子頁面需要頁內錨點（例如 IntroMobilePage），透過 useOutletContext 取用 */
  anchorLinks?: AnchorLink[];
}

/**
 * PublicLayout——landing、intro、NotFoundPage 共用的外層 layout。
 * 結構：IntroNav（sticky）+ 主內容 Outlet + IntroFooter。
 * Theme／locale 由 useSettingsStore 管理，不在 layout 內重覆處理。
 */
export default function PublicLayout({ anchorLinks }: Props) {
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
