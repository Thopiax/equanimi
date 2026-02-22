import { observable } from "@legendapp/state";
import { FocusSession } from "../../domain/aggregates/FocusSession";
import { DriftEvent } from "../../domain/entities/DriftEvent";

/**
 * Application State (Legend State Observable)
 *
 * IMPORTANT: This is ephemeral UI state (NOT persisted).
 * - Lost on app refresh/restart
 * - Hydrated from Tauri Store on startup via repositories
 * - Updated reactively during app lifecycle
 * - Persistence handled by repository layer
 *
 * Use this for UI reactivity only.
 */
export interface AppState {
  /**
   * Currently active focus session
   * null if no session is active
   */
  currentSession: FocusSession | null;

  /**
   * Current active application name
   * Updated by window tracking
   */
  currentApp: string;

  /**
   * Active drift event (most recent)
   * Used to show drift notice/overlay
   */
  activeDrift: DriftEvent | null;

  /**
   * UI state (modals, overlays, etc.)
   */
  ui: {
    showCaptureModal: boolean;
    showSetNorthModal: boolean;
  };

  /**
   * Visualization state (overlay windows)
   */
  visualization: {
    stain: {
      visible: boolean;
      progress: number; // 0-100
      mode: "fullscreen" | "windowed";
      targetBounds: { x: number; y: number; width: number; height: number } | null;
      destroyTimer: number | undefined;
    };
    timer: {
      visible: boolean;
      position: { x: number; y: number } | null;
      progress: number; // 0-100
      state: "focused" | "drifted";
      destroyTimer: number | undefined;
    };
    capture: {
      visible: boolean;
      destroyTimer: number | undefined;
    };
  };
}

/**
 * Initial state
 */
const initialState: AppState = {
  currentSession: null,
  currentApp: "",
  activeDrift: null,
  ui: {
    showCaptureModal: false,
    showSetNorthModal: false,
  },
  visualization: {
    stain: {
      visible: false,
      progress: 0,
      mode: "fullscreen",
      targetBounds: null,
      destroyTimer: undefined,
    },
    timer: {
      visible: false,
      position: null,
      progress: 0,
      state: "focused",
      destroyTimer: undefined,
    },
    capture: {
      visible: false,
      destroyTimer: undefined,
    },
  },
};

/**
 * Global application state observable
 *
 * NOTE: NOT persisted. Use repositories for persistence.
 */
export const appState$ = observable<AppState>(initialState);

/**
 * Helper: Reset state (for testing or logout scenarios)
 */
export const resetAppState = (): void => {
  appState$.set(initialState);
};
