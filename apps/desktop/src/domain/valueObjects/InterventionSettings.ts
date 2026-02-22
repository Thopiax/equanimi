/**
 * InterventionSettings Value Object
 *
 * Type-specific configuration for interventions.
 * Uses discriminated union for type-safe settings.
 */

export interface NotificationSettings {
  readonly type: "notification";
}

export interface CompassSettings {
  readonly type: "compass";
}

export interface StainSettings {
  readonly type: "stain";
  readonly mode: "fullscreen" | "windowed";
}

export interface DialogSettings {
  readonly type: "dialog";
  readonly dialogType: "commitment" | "actionPlanning";
}

export type InterventionSettings =
  | NotificationSettings
  | CompassSettings
  | StainSettings
  | DialogSettings;

/**
 * Factory: Create notification settings
 */
export const createNotificationSettings = (): NotificationSettings => ({
  type: "notification",
});

/**
 * Factory: Create compass settings
 */
export const createCompassSettings = (): CompassSettings => ({
  type: "compass",
});

/**
 * Factory: Create stain settings
 * @param mode - Display mode (fullscreen or windowed to app bounds)
 */
export const createStainSettings = (
  mode: "fullscreen" | "windowed"
): StainSettings => ({
  type: "stain",
  mode,
});

/**
 * Factory: Create dialog settings
 * @param dialogType - Type of dialog (commitment or actionPlanning)
 */
export const createDialogSettings = (
  dialogType: "commitment" | "actionPlanning"
): DialogSettings => ({
  type: "dialog",
  dialogType,
});
