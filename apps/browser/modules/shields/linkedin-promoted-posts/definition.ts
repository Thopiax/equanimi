import type { ShieldDefinition } from "../types";

export const linkedinPromotedPosts: ShieldDefinition = {
  id: "linkedin-promoted-posts",
  name: "Promoted Posts",
  description: "Hides sponsored and promoted posts in the feed",
  domain: "linkedin.com",
  icon: "\u{1F4B0}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
