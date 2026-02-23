import type { ShieldDefinition } from "./types";
import { youtubeShorts } from "./youtube-shorts/definition";
import { youtubeShortsHomepage } from "./youtube-shorts-homepage/definition";
import { youtubeSidebarRecs } from "./youtube-sidebar-recs/definition";
import { youtubeCommentsHide } from "./youtube-comments-hide/definition";
import { youtubeSponsored } from "./youtube-sponsored/definition";
import { chessPostGameCooldown } from "./chess-post-game-cooldown/definition";
import { linkedinFeedHide } from "./linkedin-feed-hide/definition";
import { linkedinNotificationBadge } from "./linkedin-notification-badge/definition";
import { linkedinPromotedPosts } from "./linkedin-promoted-posts/definition";

/**
 * Single source of truth for all registered shields.
 *
 * Adding a shield here (+ its content script entrypoint) is the only step
 * needed for it to appear in the popup and be tracked by the badge.
 */
export const shields: readonly ShieldDefinition[] = [
  youtubeShorts,
  youtubeShortsHomepage,
  youtubeSidebarRecs,
  youtubeCommentsHide,
  youtubeSponsored,
  chessPostGameCooldown,
  linkedinFeedHide,
  linkedinNotificationBadge,
  linkedinPromotedPosts,
] as const;

/** Unique domains that have at least one shield. Derived, not hand-maintained. */
export const shieldedDomains: readonly string[] = [
  ...new Set(shields.map((s) => s.domain)),
];
