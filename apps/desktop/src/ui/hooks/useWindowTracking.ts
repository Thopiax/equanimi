import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import * as O from "fp-ts/Option";
import { WindowChangeEvent } from "../../types/TauriEvents";
import { appState$ } from "../state/appState";
import { useServices } from "./useServices";

/**
 * Hook: Window Tracking
 *
 * Listens to Rust "window_changed" events and:
 * 1. Updates appState$.currentApp
 * 2. Calls SessionService.handleWindowChange (drift detection)
 * 3. Updates appState$.activeDrift if drift detected
 *
 * This is the core integration point between Rust window monitoring
 * and TypeScript drift detection logic.
 *
 * Usage:
 *   useWindowTracking(); // Call once in App component
 */
export function useWindowTracking(): void {
  const services = useServices();

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    // Set up listener for window change events from Rust
    const setupListener = async () => {
      unlisten = await listen<WindowChangeEvent>(
        "window_changed",
        async (event) => {
          const { app_name, window_title, position, timestamp } = event.payload;

          // DEV: Log all app switches with full details
          if (import.meta.env.DEV) {
            console.log(`🧭 Window changed:`, {
              app: app_name || "(unknown)",
              title: window_title || "(no title)",
              position: `${position.x},${position.y} (${position.width}×${position.height})${position.is_full_screen ? " [FULLSCREEN]" : ""}`,
              timestamp: new Date(timestamp).toLocaleTimeString(),
            });
          }

          // Update current app in state
          appState$.currentApp.set(app_name);

          // Handle drift detection via SessionService
          const result = await services.sessionService.handleWindowChange(
            app_name,
            position
          )();

          // Update activeDrift in state
          if (result._tag === "Right") {
            const maybeDrift = result.right;
            if (O.isSome(maybeDrift)) {
              appState$.activeDrift.set(O.toUndefined(maybeDrift) ?? null);
            }
          } else {
            // Log error but don't crash the app
            console.error("Drift detection error:", result.left);
          }
        }
      );
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [services]);
}
