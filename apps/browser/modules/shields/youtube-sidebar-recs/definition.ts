import type { ShieldDefinition } from "../types";

export const youtubeSidebarRecs: ShieldDefinition = {
  id: "youtube-sidebar-recs",
  name: "Sidebar Recs Hide",
  description: "Hides recommended videos sidebar while watching",
  domain: "youtube.com",
  icon: "\u{1F441}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
