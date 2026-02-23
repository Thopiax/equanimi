import type { ShieldDefinition } from "../types";

export const linkedinFeedHide: ShieldDefinition = {
  id: "linkedin-feed-hide",
  name: "Feed Hide",
  description: "Hides the LinkedIn feed to reduce mindless scrolling",
  domain: "linkedin.com",
  icon: "\u{1F4F0}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
