import type { ShieldDefinition } from "../types";

export const youtubeCommentsHide: ShieldDefinition = {
  id: "youtube-comments-hide",
  name: "Comments Hide",
  description: "Hides the comments section on videos and Shorts",
  domain: "youtube.com",
  icon: "\u{1F4AC}",
  mechanism: "access-block",
  defaultEnabled: true,
};
