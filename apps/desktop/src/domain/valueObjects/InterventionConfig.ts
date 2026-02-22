import { InterventionType } from "./InterventionType";
import { TriggerCondition } from "./TriggerCondition";
import {
  InterventionSettings,
  NotificationSettings,
  CompassSettings,
  StainSettings,
  DialogSettings,
} from "./InterventionSettings";

/**
 * InterventionConfig Value Object
 *
 * Complete configuration for a single intervention.
 * Combines type, enabled state, trigger condition, and type-specific settings.
 */
export interface InterventionConfig {
  readonly type: InterventionType;
  readonly enabled: boolean;
  readonly trigger: TriggerCondition;
  readonly settings: InterventionSettings;
}

/**
 * Factory: Create intervention configuration
 * Type-safe overloads ensure settings.type matches intervention type
 */
export function createInterventionConfig(
  type: "notification",
  enabled: boolean,
  trigger: TriggerCondition,
  settings: NotificationSettings
): InterventionConfig;
export function createInterventionConfig(
  type: "compass",
  enabled: boolean,
  trigger: TriggerCondition,
  settings: CompassSettings
): InterventionConfig;
export function createInterventionConfig(
  type: "stain",
  enabled: boolean,
  trigger: TriggerCondition,
  settings: StainSettings
): InterventionConfig;
export function createInterventionConfig(
  type: "dialog",
  enabled: boolean,
  trigger: TriggerCondition,
  settings: DialogSettings
): InterventionConfig;
export function createInterventionConfig(
  type: InterventionType,
  enabled: boolean,
  trigger: TriggerCondition,
  settings: InterventionSettings
): InterventionConfig {
  return {
    type,
    enabled,
    trigger,
    settings,
  };
}
