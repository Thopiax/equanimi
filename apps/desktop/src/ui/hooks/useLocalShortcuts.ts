import { useHotkeys } from "react-hotkeys-hook";

/**
 * Hook: Local Keyboard Shortcuts
 *
 * Registers keyboard shortcuts that only work when app window has focus.
 * For global shortcuts (work in background), use useGlobalShortcuts instead.
 */
export function useLocalShortcuts() {
  // Cmd+, or Ctrl+, - Open preferences (standard macOS/Windows shortcut)
  useHotkeys("mod+comma", () => {
    window.location.hash = "#preferences";
  });

  // ESC - Close preferences / go back to main
  useHotkeys("escape", () => {
    if (window.location.hash === "#preferences") {
      window.location.hash = "";
    }
  });
}
