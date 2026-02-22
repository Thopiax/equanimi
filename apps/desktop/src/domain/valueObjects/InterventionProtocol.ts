import { InterventionConfig, createInterventionConfig } from "./InterventionConfig";
import { InterventionType } from "./InterventionType";
import {
  createImmediateTrigger,
  createDelayedTrigger,
} from "./TriggerCondition";
import {
  createNotificationSettings,
  createCompassSettings,
  createStainSettings,
} from "./InterventionSettings";

/**
 * InterventionProtocol Value Object
 *
 * Defines the complete set of interventions for a focus session.
 * Replaces the old AlertPolicy with a more composable, extensible design.
 */
export interface InterventionProtocol {
  readonly interventions: ReadonlyArray<InterventionConfig>;
}

/**
 * Factory: Create intervention protocol
 * @param interventions - Array of intervention configs (defaults to defaultInterventions)
 */
export const createInterventionProtocol = (
  interventions: InterventionConfig[] = []
): InterventionProtocol => ({
  interventions: interventions.length > 0 ? interventions : defaultInterventions(),
});

/**
 * Default intervention configuration
 * - Notification: enabled, immediate
 * - Compass: enabled, immediate (persistent HUD showing alignment)
 * - Stain: disabled by default, 30s delay if enabled
 */
const defaultInterventions = (): InterventionConfig[] => [
  createInterventionConfig(
    "notification" as const,
    true,
    createImmediateTrigger(),
    createNotificationSettings()
  ),
  createInterventionConfig(
    "compass" as const,
    true,
    createImmediateTrigger(),
    createCompassSettings()
  ),
  createInterventionConfig(
    "stain" as const,
    false, // Disabled by default
    createDelayedTrigger(30000), // 30s delay if enabled
    createStainSettings("fullscreen")
  ),
];

/**
 * Factory: Create default intervention protocol
 */
export const defaultInterventionProtocol = (): InterventionProtocol =>
  createInterventionProtocol();

/**
 * Get all enabled interventions from protocol
 */
export const getEnabledInterventions = (
  protocol: InterventionProtocol
): ReadonlyArray<InterventionConfig> =>
  protocol.interventions.filter((i) => i.enabled);

/**
 * Check if specific intervention type is enabled
 */
export const isInterventionEnabled = (
  protocol: InterventionProtocol,
  type: InterventionType
): boolean => protocol.interventions.some((i) => i.type === type && i.enabled);

/**
 * Get all interventions
 */
export const getInterventions = (
  protocol: InterventionProtocol
): ReadonlyArray<InterventionConfig> => protocol.interventions;
