import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { appState$ } from "../state/appState";
import { useServices } from "./useServices";

/**
 * Create action handlers with service access
 */
function createActionHandlers(
  services: ReturnType<typeof useServices>
): Record<string, () => void | Promise<void>> {
  return {
    captureModal: async () => {
      await services.interventionOrchestrator.toggleCapture()();
    },
    startSession: () => {
      appState$.ui.showSetNorthModal.set(!appState$.ui.showSetNorthModal.get());
    },
  };
}

/**
 * Handle a shortcut action
 */
function handleAction(
  action: string,
  handlers: Record<string, () => void | Promise<void>>
): void {
  const handler = handlers[action];
  if (handler) {
    handler();
  } else {
    console.warn(`Unknown shortcut action: ${action}`);
  }
}

/**
 * Hook: Global Shortcuts
 *
 * Loads shortcuts from config and registers them globally.
 * Shortcuts work even when app is in background.
 *
 * Usage:
 *   useGlobalShortcuts(); // Call once in App component
 */
export function useGlobalShortcuts(): void {
  const services = useServices();

  useEffect(() => {
    const registeredShortcuts: string[] = [];
    const actionHandlers = createActionHandlers(services);

    const setupShortcuts = async () => {
      try {
        // Load config
        const configResult = await services.configService.getConfig()();
        if (configResult._tag === "Left") {
          console.error("Failed to load config:", configResult.left);
          return;
        }

        const shortcuts = configResult.right.globalShortcuts ?? {};

        // Register each non-null shortcut
        for (const [action, shortcut] of Object.entries(shortcuts)) {
          if (shortcut) {
            try {
              await register(shortcut, () =>
                handleAction(action, actionHandlers)
              );
              registeredShortcuts.push(shortcut);
            } catch (error) {
              console.error(
                `Failed to register shortcut ${shortcut} for ${action}:`,
                error
              );
            }
          }
        }

        console.log("Global shortcuts registered");
      } catch (error) {
        console.error("Failed to setup shortcuts:", error);
      }
    };

    setupShortcuts();

    // Cleanup: unregister only successfully registered shortcuts
    return () => {
      for (const shortcut of registeredShortcuts) {
        unregister(shortcut).catch(console.error);
      }
    };
  }, [services]);
}
