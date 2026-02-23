import { shieldEnabled } from "@/utils/storage";
import { linkedinFeedHide } from "@/modules/shields/linkedin-feed-hide/definition";
import "./style.css";

/**
 * Content script: LinkedIn Feed Hide
 *
 * CSS-driven shield with a placeholder message so users know
 * the feed is intentionally hidden, not broken.
 */

const CSS_CLASS = `equanimi-${linkedinFeedHide.id}-active`;
const enabled = shieldEnabled(linkedinFeedHide.id, linkedinFeedHide.defaultEnabled);
const PLACEHOLDER_ID = "equanimi-linkedin-feed-placeholder";

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  runAt: "document_idle",

  async main() {
    const isEnabled = await enabled.getValue();
    toggle(isEnabled);

    enabled.watch((newValue) => toggle(newValue));

    // LinkedIn is an SPA — watch for navigation to re-inject placeholder.
    const observer = new MutationObserver(() => {
      if (active) {
        injectPlaceholder();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});

let active = false;

function toggle(on: boolean): void {
  active = on;
  document.documentElement.classList.toggle(CSS_CLASS, on);

  if (on) {
    injectPlaceholder();
  } else {
    removePlaceholder();
  }
}

function injectPlaceholder(): void {
  if (document.getElementById(PLACEHOLDER_ID)) {
    return;
  }

  // Find the feed's parent container on the homepage
  const feedParent =
    document.querySelector(".scaffold-finite-scroll")?.parentElement ??
    document.querySelector("main");
  if (!feedParent) {
    return;
  }

  const placeholder = document.createElement("div");
  placeholder.id = PLACEHOLDER_ID;
  placeholder.textContent = "Feed hidden by Equanimi";
  placeholder.style.cssText = `
    padding: 48px 24px;
    text-align: center;
    color: #666;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
    margin: 16px 0;
  `;

  feedParent.prepend(placeholder);
}

function removePlaceholder(): void {
  document.getElementById(PLACEHOLDER_ID)?.remove();
}
