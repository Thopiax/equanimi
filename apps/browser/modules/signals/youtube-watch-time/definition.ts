import type { SignalDefinition } from "../types";

export const youtubeWatchTime: SignalDefinition = {
  id: "youtube-watch-time",
  name: "Watch Time",
  description: "Shows how long you\u2019ve been watching YouTube today",
  domain: "youtube.com",
  icon: "\u23F1",
  mechanism: "self-monitoring",
  defaultEnabled: true,
};
