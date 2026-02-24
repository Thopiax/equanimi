import type { SignalDefinition } from "../types";

export const youtubeStain: SignalDefinition = {
  id: "youtube-stain",
  name: "Watch Stain",
  description: "Dark ink blot that grows over the video as watch time accumulates",
  domain: "youtube.com",
  icon: "🫠",
  mechanism: "self-monitoring",
  defaultEnabled: true,
};
