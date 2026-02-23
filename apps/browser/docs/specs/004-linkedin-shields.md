# 004 — LinkedIn Shields

Essential attention shields for LinkedIn, targeting the highest-impact attention traps.

## Shields

Five shields, all targeting `linkedin.com`, all using `cue-removal` (BCT #12.3).

| ID | Name | Default | Target | Placeholder |
|---|---|---|---|---|
| `linkedin-feed-hide` | Feed Hide | on | Main feed container on homepage | Yes |
| `linkedin-notification-badge` | Notification Badge | on | Red dot/count on bell icon | No |
| `linkedin-sidebar-recs` | Sidebar Recs | on | "People you may know", "Add to your feed" | Yes |
| `linkedin-ads` | Ads Hide | on | Sidebar ad units, banner ads | Yes |
| `linkedin-promoted-posts` | Promoted Posts | on | Sponsored posts in feed | No |

Spatial shields (feed, sidebar recs, ads) inject a placeholder message when active. Small/inline shields (notification badge, promoted posts) hide silently via CSS.

## Architecture

Each shield follows the established pattern:

```
modules/shields/<id>/definition.ts          # ShieldDefinition
entrypoints/<id>.content/index.ts           # Content script
entrypoints/<id>.content/style.css          # CSS hide rules
```

Content scripts:
- Read enabled state from `shieldEnabled()` storage
- Toggle CSS class on `<html>` (e.g., `equanimi-linkedin-feed-hide-active`)
- Watch storage changes for popup toggle reactivity
- Placeholder shields: `MutationObserver` to inject/remove placeholder (SPA navigation)

All content scripts match `*://*.linkedin.com/*`.

## Registry changes

- Add all 5 definitions to `modules/shields/registry.ts`
- Add `"linkedin.com"` to `COOLDOWN_DOMAINS` in `entrypoints/popup/main.ts`

## CSS selectors

These selectors target LinkedIn's current DOM. They will need monitoring as LinkedIn updates.

- **Feed**: `div.feed-shared-update-v2` parent container, or the main feed `<div>` within `role="main"`
- **Notification badge**: `.notification-badge`, `.notification-badge__count`
- **Sidebar recs**: `.feed-follows-module`, `aside` panels with recommendation content
- **Ads**: `[data-ad-banner]`, sidebar ad containers
- **Promoted posts**: posts containing "Promoted" label span

Exact selectors to be verified during implementation by inspecting LinkedIn's live DOM.

## Approach

CSS-driven hiding with DOM placeholders for spatial shields. Minimal JS footprint. Same implementation pattern as the existing `youtube-comments-hide` shield.

## Reference

Inspired by LinkOff (MIT, by Noah Jelich) — Equanimi focuses on the essential attention traps rather than exhaustive toggle coverage, grounding each shield in behavioral science (BCT #12.3 — restructuring the physical environment / removing cues).
