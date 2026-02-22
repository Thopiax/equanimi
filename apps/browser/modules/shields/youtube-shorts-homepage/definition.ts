import type { ShieldDefinition } from "../types";

export const youtubeShortsHomepage: ShieldDefinition = {
  id: "youtube-shorts-homepage",
  name: "Shorts Homepage",
  description: "Removes Shorts tiles and shelves from feeds and navigation",
  domain: "youtube.com",
  icon: "\u{1F6AB}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
