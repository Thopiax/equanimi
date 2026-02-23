import { shieldEnabled } from "@/utils/storage";
import { linkedinPromotedPosts } from "@/modules/shields/linkedin-promoted-posts/definition";
import "./style.css";

/**
 * Content script: LinkedIn Promoted Posts Hide
 *
 * Pure CSS shield — hides sponsored/promoted posts in the feed.
 */

const CSS_CLASS = `equanimi-${linkedinPromotedPosts.id}-active`;
const enabled = shieldEnabled(
  linkedinPromotedPosts.id,
  linkedinPromotedPosts.defaultEnabled,
);

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  runAt: "document_idle",

  async main() {
    const isEnabled = await enabled.getValue();
    toggle(isEnabled);

    enabled.watch((newValue) => toggle(newValue));
  },
});

function toggle(on: boolean): void {
  document.documentElement.classList.toggle(CSS_CLASS, on);
}
