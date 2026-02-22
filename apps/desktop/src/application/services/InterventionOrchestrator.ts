import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  FocusSession,
  getInterventionProtocol,
} from "../../domain/aggregates/FocusSession";
import { DriftEvent } from "../../domain/entities/DriftEvent";
import { InterventionConfig } from "../../domain/valueObjects/InterventionConfig";
import { getEnabledInterventions } from "../../domain/valueObjects/InterventionProtocol";
import { InterventionType } from "../../domain/valueObjects/InterventionType";
import {
  IIntervention,
  InterventionContext,
} from "../../domain/interventions/IIntervention";
import { IOverlayManager } from "../../infrastructure/ports/IOverlayManager";

interface InterventionState {
  lastTriggered: number;
  eventCount: number;
}

/**
 * Application Service: Intervention Orchestrator
 *
 * Orchestrates intervention delivery based on session's InterventionProtocol.
 * Uses Strategy Pattern - delegates to domain intervention services via registry lookup.
 *
 * This is the "brain" that decides which interventions to trigger and when,
 * but execution logic lives in domain services (adheres to Open/Closed Principle).
 */
export class InterventionOrchestrator {
  private interventions: Map<InterventionType, IIntervention>;
  private activeInterventions = new Map<string, InterventionState>();

  constructor(
    interventions: Map<InterventionType, IIntervention>,
    private readonly overlayManager: IOverlayManager
  ) {
    this.interventions = interventions;
  }

  /**
   * Handle drift detection - trigger enabled interventions
   */
  onDriftDetected(
    session: FocusSession,
    driftEvent: DriftEvent,
    windowPosition?: { x: number; y: number; width: number; height: number }
  ): TE.TaskEither<string, void> {
    const protocol = getInterventionProtocol(session);
    const enabled = getEnabledInterventions(protocol);

    const context: InterventionContext = { session, driftEvent, windowPosition };

    // Filter interventions that should trigger
    const toTrigger = enabled.filter((config) =>
      this.shouldTrigger(config, Date.now())
    );

    // Execute interventions via registry lookup
    return pipe(
      TE.sequenceArray(
        toTrigger.map((config) => {
          const intervention = this.interventions.get(config.type);
          if (!intervention) {
            return TE.left(`Unknown intervention type: ${config.type}`);
          }

          // Update state
          const state = this.getOrCreateState(config.type);
          state.lastTriggered = Date.now();
          state.eventCount += 1;

          return intervention.execute(config, context);
        })
      ),
      TE.map(() => void 0)
    );
  }

  /**
   * Handle drift cleared - notify interventions
   */
  onDriftCleared(session: FocusSession): TE.TaskEither<string, void> {
    const protocol = getInterventionProtocol(session);
    const enabled = getEnabledInterventions(protocol);
    const context: InterventionContext = { session };

    // Call onDriftCleared for all enabled interventions that support it
    return pipe(
      TE.sequenceArray(
        enabled
          .map((config) => this.interventions.get(config.type))
          .filter((i): i is IIntervention => i !== undefined)
          .filter((i) => i.onDriftCleared !== undefined)
          .map((i) => i.onDriftCleared!(context))
      ),
      TE.map(() => void 0)
    );
  }

  /**
   * Start session - call onSessionStart for enabled interventions
   */
  onSessionStart(session: FocusSession): TE.TaskEither<string, void> {
    const protocol = getInterventionProtocol(session);
    const enabled = getEnabledInterventions(protocol);
    const context: InterventionContext = { session };

    // Call onSessionStart for all enabled interventions that support it
    return pipe(
      TE.sequenceArray(
        enabled
          .map((config) => this.interventions.get(config.type))
          .filter((i): i is IIntervention => i !== undefined)
          .filter((i) => i.onSessionStart !== undefined)
          .map((i) => i.onSessionStart!(context))
      ),
      TE.map(() => void 0)
    );
  }

  /**
   * End session - call onSessionEnd for all interventions
   */
  onSessionEnd(): TE.TaskEither<string, void> {
    this.activeInterventions.clear();

    // Call onSessionEnd for all registered interventions that support it
    return pipe(
      TE.sequenceArray(
        Array.from(this.interventions.values())
          .filter((i) => i.onSessionEnd !== undefined)
          .map((i) => i.onSessionEnd!())
      ),
      TE.map(() => void 0)
    );
  }

  /**
   * Toggle capture modal (global shortcut)
   * Not controlled by intervention protocol (always available)
   */
  toggleCapture(): TE.TaskEither<string, void> {
    return this.overlayManager.showCapture();
  }

  // Private helpers

  private shouldTrigger(config: InterventionConfig, now: number): boolean {
    const state = this.getOrCreateState(config.type);

    switch (config.trigger.type) {
      case "immediate":
        return true;

      case "delayed":
        // Only trigger if enough time has passed since last trigger
        const elapsed = now - state.lastTriggered;
        return state.lastTriggered === 0 || elapsed >= config.trigger.delayMs;

      case "threshold":
        return state.eventCount >= config.trigger.eventCount;

      case "budget-based":
        // Budget-based triggers not yet implemented in desktop
        return false;
    }
  }

  private getOrCreateState(type: string): InterventionState {
    if (!this.activeInterventions.has(type)) {
      this.activeInterventions.set(type, {
        lastTriggered: 0,
        eventCount: 0,
      });
    }
    return this.activeInterventions.get(type)!;
  }
}
