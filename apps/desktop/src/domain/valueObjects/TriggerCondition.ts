/**
 * TriggerCondition Value Object
 *
 * Re-exported from @equanimi/domain. Defines when an intervention should
 * be triggered. The shared domain includes all variants:
 * - immediate: Trigger immediately on drift detection
 * - delayed: Wait N ms before triggering
 * - threshold: Trigger after N drift events
 * - budget-based: Trigger when budget progress exceeds threshold
 */
export type { TriggerCondition } from "@equanimi/domain";
export {
  createImmediateTrigger,
  createDelayedTrigger,
  createThresholdTrigger,
  createBudgetTrigger,
} from "@equanimi/domain";
