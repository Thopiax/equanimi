/**
 * Trigger conditions for interventions.
 *
 * Defines WHEN an intervention activates. Both surfaces use triggers,
 * but the activation context differs:
 *
 * Desktop: triggers evaluate against a stream of DriftEvents
 *   (e.g., "trigger notification immediately when drift detected")
 *
 * Browser: triggers are often implicit (content script runs when page matches),
 *   but can be explicit for time-based or budget-based activation
 *   (e.g., "show cooldown after 30s delay", "escalate at 80% budget")
 */

// ── Trigger Condition ───────────────────────────────────────────

export type TriggerCondition =
  | { readonly type: "immediate" }
  | { readonly type: "delayed"; readonly delayMs: number }
  | { readonly type: "threshold"; readonly eventCount: number }
  | { readonly type: "budget-based"; readonly progressThreshold: number };

// ── Factories ───────────────────────────────────────────────────

export const createImmediateTrigger = (): TriggerCondition => ({
  type: "immediate",
});

export const createDelayedTrigger = (delayMs: number): TriggerCondition => ({
  type: "delayed",
  delayMs,
});

export const createThresholdTrigger = (
  eventCount: number,
): TriggerCondition => ({
  type: "threshold",
  eventCount,
});

export const createBudgetTrigger = (
  progressThreshold: number,
): TriggerCondition => ({
  type: "budget-based",
  progressThreshold,
});
