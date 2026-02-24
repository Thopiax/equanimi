import type { SignalDefinition } from "./types";
import { youtubeWatchTime } from "./youtube-watch-time/definition";
import { youtubeStain } from "./youtube-stain/definition";

/**
 * Single source of truth for all registered signals.
 *
 * Adding a signal here (+ its content script entrypoint) is the only step
 * needed for it to appear in the popup and be tracked by the badge.
 */
export const signals: readonly SignalDefinition[] = [
  youtubeWatchTime,
  youtubeStain,
] as const;
