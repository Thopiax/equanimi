import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { INotificationService } from "../../infrastructure/ports/INotificationService";
import {
  FocusSession,
  getTaskName,
} from "../../domain/aggregates/FocusSession";

/**
 * Application Service: Notification Facade
 *
 * High-level notification operations with domain-aware formatting.
 */
export class NotificationFacade {
  constructor(private readonly notificationService: INotificationService) {}

  /**
   * Send a drift alert notification
   * Format: "🧭 Off Course\nYou're in {app}\nYour north: {task}"
   */
  sendDriftAlert(
    session: FocusSession,
    currentApp: string
  ): TE.TaskEither<string, void> {
    return pipe(
      TE.right({
        title: "🧭 Off Course",
        body: `You're in ${currentApp}\nYour north: ${getTaskName(session)}`,
      }),
      TE.chainW((notification) => this.notificationService.send(notification))
    );
  }

  /**
   * Ensure notification permissions are granted
   * @returns true if permissions are granted (or successfully requested)
   */
  ensurePermissions(): TE.TaskEither<string, boolean> {
    return pipe(
      this.notificationService.checkPermission(),
      TE.chainW((granted) =>
        granted ? TE.right(true) : this.notificationService.requestPermission()
      )
    );
  }

  /**
   * Check if notification permissions are currently granted
   */
  hasPermission(): TE.TaskEither<string, boolean> {
    return this.notificationService.checkPermission();
  }
}
