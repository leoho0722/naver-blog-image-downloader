export interface AnchorLink {
  /** 頁內錨點 hash（例如 `#features`） */
  href: string;
  /** i18n key */
  labelKey: string;
}

export interface PublicRouteHandle {
  anchorLinks?: AnchorLink[];
}

export const INTRO_MOBILE_ANCHOR_LINKS: AnchorLink[] = [
  { href: "#features", labelKey: "intro.mobile.nav.features" },
  { href: "#how-it-works", labelKey: "intro.mobile.nav.howItWorks" },
  { href: "#screenshots", labelKey: "intro.mobile.nav.screenshots" },
  { href: "#download", labelKey: "intro.mobile.nav.download" },
];

/**
 * 走向 Public 頁面 footer 的連結配置。
 *
 * `to` 為 React Router 內部路徑，點擊會觸發 SPA 導覽（`<Link>`）。
 * 日後若新增使用者條款等法務頁面，於此陣列擴充即可，
 * 不必再動 `IntroFooter`。
 */
export interface PublicFooterLink {
  /** React Router 相對路徑 */
  to: string;
  /** i18n key */
  labelKey: string;
}

export const PUBLIC_FOOTER_LINKS: PublicFooterLink[] = [
  { to: "/privacy", labelKey: "privacy.footerLink" },
];
