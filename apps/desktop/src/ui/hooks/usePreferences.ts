import { useState, useEffect, useMemo } from "react";
import { useServices } from "./useServices";
import type { AppConfig } from "../../types/AppConfig";

/**
 * Hook: Preferences Management
 *
 * Provides access to app configuration with methods to update settings.
 * Acts as adapter between presenter (UI) and application layer (ConfigService).
 * Auto-saves changes and reloads to apply.
 */
export function usePreferences() {
  const services = useServices();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [shortcuts, setShortcuts] = useState<{
    captureModal: string;
    startSession: string;
  }>({
    captureModal: "",
    startSession: "",
  });

  // Load shortcuts on mount
  useEffect(() => {
    const loadConfig = async () => {
      const result = await services.configService.getConfig()();
      if (result._tag === "Right") {
        setShortcuts({
          captureModal: result.right.globalShortcuts?.captureModal || "",
          startSession: result.right.globalShortcuts?.startSession || "",
        });
        setConfig(result.right);
      }
    };
    loadConfig();
  }, [services]);

  const defaultSessionDuration = useMemo(() => {
    return config ? config.defaultSessionDuration : 90;
  }, [config]);

  const updateDefaultSessionDuration = async (
    minutes: number
  ): Promise<void> => {
    // Update local state immediately for responsiveness
    const newConfig = {
      ...config!,
      defaultSessionDuration: minutes,
    };

    // Save to config
    const result = await services.configService.updateConfig(newConfig)();

    if (result._tag === "Right") {
      setConfig(newConfig);
    } else {
      console.error("Failed to save default session duration:", result.left);
      // Revert on error
      setConfig(config);
    }
  };

  /**
   * Update a specific shortcut (auto-saves)
   */
  const updateShortcut = async (
    key: "captureModal" | "startSession",
    value: string
  ): Promise<void> => {
    // Update local state immediately for responsiveness
    const newShortcuts = { ...shortcuts, [key]: value };
    setShortcuts(newShortcuts);

    // Save to config
    const result = await services.configService.updateShortcuts({
      captureModal: newShortcuts.captureModal || null,
      startSession: newShortcuts.startSession || null,
    })();

    if (result._tag === "Right") {
      // Reload to re-register shortcuts
      window.location.reload();
    } else {
      console.error("Failed to save shortcuts:", result.left);
      // Revert on error
      setShortcuts(shortcuts);
    }
  };

  return {
    defaultSessionDuration,
    updateDefaultSessionDuration,
    shortcuts,
    updateShortcut,
  };
}
