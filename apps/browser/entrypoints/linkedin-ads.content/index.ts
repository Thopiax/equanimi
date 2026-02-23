import { shieldEnabled } from "@/utils/storage";
import { linkedinAds } from "@/modules/shields/linkedin-ads/definition";
import "./style.css";

/**
 * Content script: LinkedIn Ads Hide
 *
 * CSS-driven shield with a MutationObserver to catch
 * dynamically injected ad containers.
 */

const CSS_CLASS = `equanimi-${linkedinAds.id}-active`;
const enabled = shieldEnabled(linkedinAds.id, linkedinAds.defaultEnabled);

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
