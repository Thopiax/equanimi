import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Equanimi",
    description:
      "Stopping cues for the internet. Modular attention shields for YouTube, LinkedIn, Chess.com and more.",
    permissions: ["storage", "tabs", "activeTab"],
    icons: {
      "16": "/icons/icon-16.png",
      "32": "/icons/icon-32.png",
      "48": "/icons/icon-48.png",
      "128": "/icons/icon-128.png",
    },
  },
});
