import * as TE from "fp-ts/TaskEither";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { InterventionSpec } from "../valueObjects/InterventionMetadata";
import { FocusSession } from "../aggregates/FocusSession";
import { DriftEvent } from "../entities/DriftEvent";

/**
 * Intervention Context
 *
 * Provides all necessary context for intervention execution.
 */
export interface InterventionContext {
  readonly session: FocusSession;
  readonly driftEvent?: DriftEvent;
  readonly windowPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Domain Service: Intervention
 *
 * Represents a behavior change intervention with execution logic
 * and behavioral science metadata (BCT/PDP).
 *
 * Each intervention type implements this interface as a domain service,
 * enabling the Strategy Pattern and adhering to the Open/Closed Principle.
 */
export interface IIntervention {
  /**
   * Execute this intervention in response to a drift event
   */
  execute(
    config: InterventionConfig,
    context: InterventionContext
  ): TE.TaskEither<string, void>;

  /**
   * Get BCT/PDP metadata for this intervention
   * Returns behavioral science specification (for internal documentation)
   */
  getMetadata(): InterventionSpec;

  /**
   * Called when session starts (for persistent interventions like Compass)
   * Optional lifecycle hook
   */
  onSessionStart?(context: InterventionContext): TE.TaskEither<string, void>;

  /**
   * Called when session ends
   * Optional lifecycle hook
   */
  onSessionEnd?(): TE.TaskEither<string, void>;

  /**
   * Called when drift is cleared (for cleanup/state updates)
   * Optional lifecycle hook
   */
  onDriftCleared?(context: InterventionContext): TE.TaskEither<string, void>;
}
