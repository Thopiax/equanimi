import type { ShieldDefinition } from "../types";

export const linkedinAds: ShieldDefinition = {
  id: "linkedin-ads",
  name: "Ads Hide",
  description: "Hides sidebar and banner advertisements",
  domain: "linkedin.com",
  icon: "\u{1F6AB}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
