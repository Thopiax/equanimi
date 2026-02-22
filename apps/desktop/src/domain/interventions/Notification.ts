import * as TE from "fp-ts/TaskEither";
import { IIntervention, InterventionContext } from "./IIntervention";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { INTERVENTION_METADATA } from "../valueObjects/InterventionMetadata";
import { INotificationService } from "../../infrastructure/ports/INotificationService";

/**
 * Notification Intervention (Domain Service)
 *
 * System notification on drift detection.
 * Provides a peripheral awareness cue when user drifts from intention.
 *
 * Implements:
 * - BCT 7.1: Prompts/cues
 * - PDP: Suggestion, Reminders
 *
 * Mechanisms of Action: Behavioral Cueing, Environmental Context
 */
export class Notification implements IIntervention {
  constructor(private readonly notificationService: INotificationService) {}

  /**
   * Execute on drift - send notification
   */
  execute(
    _config: InterventionConfig,
    _context: InterventionContext
  ): TE.TaskEither<string, void> {
    return this.notificationService.send({
      title: "Caution: Drift Detected",
      body: "You're drifting away from your intention.",
    });
  }

  /**
   * Get BCT/PDP metadata
   */
  getMetadata() {
    return INTERVENTION_METADATA.notification;
  }
}
