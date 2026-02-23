import { shieldEnabled } from "@/utils/storage";
import { linkedinSidebarRecs } from "@/modules/shields/linkedin-sidebar-recs/definition";
import "./style.css";

/**
 * Content script: LinkedIn Sidebar Recommendations Hide
 *
 * CSS-driven shield with a placeholder in the sidebar area.
 */

const CSS_CLASS = `equanimi-${linkedinSidebarRecs.id}-active`;
const enabled = shieldEnabled(linkedinSidebarRecs.id, linkedinSidebarRecs.defaultEnabled);
const PLACEHOLDER_ID = "equanimi-linkedin-sidebar-placeholder";

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  runAt: "document_idle",

  async main() {
    const isEnabled = await enabled.getValue();
    toggle(isEnabled);

    enabled.watch((newValue) => toggle(newValue));

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

  const sidebar = document.querySelector("aside.scaffold-layout__aside");
  if (!sidebar?.parentElement) {
    return;
  }

  const placeholder = document.createElement("div");
  placeholder.id = PLACEHOLDER_ID;
  placeholder.textContent = "Sidebar hidden by Equanimi";
  placeholder.style.cssText = `
    padding: 24px;
    text-align: center;
    color: #666;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  sidebar.parentElement.insertBefore(placeholder, sidebar.nextSibling);
}

function removePlaceholder(): void {
  document.getElementById(PLACEHOLDER_ID)?.remove();
}
