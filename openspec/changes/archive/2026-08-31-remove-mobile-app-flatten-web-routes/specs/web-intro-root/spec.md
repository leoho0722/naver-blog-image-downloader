## REMOVED Requirements

### Requirement: Root landing page at /

**Reason**: The root page existed to let visitors choose between the mobile App and the Web version. With the mobile App removed from the project, the choice has exactly one option and the page is a pointless intermediate step between the visitor and the product.

**Migration**: The `/` route is now served by the `web-landing` capability, which renders `LandingPage` — the hero title and two-line tagline of the former `IntroRootPage` merged with the feature cards, CTA, and technology stack line of the former `IntroWebPage`. No redirect is needed because the path itself is unchanged; only the rendered component changes. The i18n keys `intro.root.cardAppTitle`, `intro.root.cardAppDesc`, `intro.root.cardWebTitle`, `intro.root.cardWebDesc`, and `intro.root.cardLearnMore` are deleted from all four locales.

### Requirement: Landing page i18n for four locales

**Reason**: The `intro.root.*` namespace is redefined by the `web-landing` capability, which absorbs the feature, CTA, and technology-stack keys formerly under `intro.web.*` and drops the platform-selection card keys.

**Migration**: See the requirement of the same name in the `web-landing` capability, which specifies the new `intro.root.*` key set and the four-locale parity rule.

### Requirement: Landing page theme and responsive design

**Reason**: The requirement is scoped to the two-card grid of the former selection page, which no longer exists.

**Migration**: See the requirement of the same name in the `web-landing` capability, which restates the three-theme and M3-token rules against the new four-feature-card layout.
