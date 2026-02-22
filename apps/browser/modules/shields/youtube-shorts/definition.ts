import type { ShieldDefinition } from "../types";

export const youtubeShorts: ShieldDefinition = {
  id: "youtube-shorts-scroll-lock",
  name: "Shorts Scroll Lock",
  description: "Blocks compulsive scrolling on YouTube Shorts",
  domain: "youtube.com",
  icon: "\u{1F4FA}",
  mechanism: "access-block",
  defaultEnabled: true,
};
