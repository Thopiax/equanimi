import type { ShieldDefinition } from "../types";

export const linkedinSidebarRecs: ShieldDefinition = {
  id: "linkedin-sidebar-recs",
  name: "Sidebar Recs",
  description: "Hides sidebar recommendations and 'People you may know'",
  domain: "linkedin.com",
  icon: "\u{1F465}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
