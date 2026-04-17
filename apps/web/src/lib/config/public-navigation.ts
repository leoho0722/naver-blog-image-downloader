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
