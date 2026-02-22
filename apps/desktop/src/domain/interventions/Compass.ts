import * as TE from "fp-ts/TaskEither";
import { IIntervention, InterventionContext } from "./IIntervention";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { INTERVENTION_METADATA } from "../valueObjects/InterventionMetadata";
import { getProgress } from "../aggregates/FocusSession";
import { IOverlayManager } from "../../infrastructure/ports/IOverlayManager";

/**
 * Compass Intervention (Domain Service)
 *
 * Persistent navigation HUD showing alignment with intention.
 * Displays focus state (focused vs drifted) and session progress.
 *
 * Implements:
 * - BCT 2.3: Self-monitoring of behavior
 * - BCT 2.2: Feedback on behavior
 * - PDP: Self-monitoring, Feedback
 *
 * Mechanisms of Action: Behavioral Regulation, Feedback Processes
 */
export class Compass implements IIntervention {
  constructor(private readonly overlayManager: IOverlayManager) {}

  /**
   * Execute on drift - update compass to drifted state
   */
  execute(
    _config: InterventionConfig,
    context: InterventionContext
  ): TE.TaskEither<string, void> {
    return this.overlayManager.updateCompass({
      progress: getProgress(context.session),
      state: "drifted",
    });
  }

  /**
   * Show compass when session starts
   */
  onSessionStart(_context: InterventionContext): TE.TaskEither<string, void> {
    return this.overlayManager.showCompass(0);
  }

  /**
   * Hide compass when session ends
   */
  onSessionEnd(): TE.TaskEither<string, void> {
    return this.overlayManager.hideCompass();
  }

  /**
   * Update to focused state when drift is cleared
   */
  onDriftCleared(context: InterventionContext): TE.TaskEither<string, void> {
    return this.overlayManager.updateCompass({
      progress: getProgress(context.session),
      state: "focused",
    });
  }

  /**
   * Get BCT/PDP metadata
   */
  getMetadata() {
    return INTERVENTION_METADATA.compass;
  }
}
