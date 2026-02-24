import type { ShieldDefinition } from "../types";

export const linkedinNotificationBadge: ShieldDefinition = {
  id: "linkedin-notification-badge",
  name: "Notification Badge",
  description: "Hides the notification count badge on the bell icon",
  domain: "linkedin.com",
  icon: "\u{1F514}",
  mechanism: "cue-removal",
  defaultEnabled: true,
};
