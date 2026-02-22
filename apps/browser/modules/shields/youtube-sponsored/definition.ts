import type { ShieldDefinition } from "../types";

export const youtubeSponsored: ShieldDefinition = {
  id: "youtube-sponsored",
  name: "Sponsored Content",
  description: "Removes ads and promoted videos from feeds",
  domain: "youtube.com",
  icon: "\u{1F4B0}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
