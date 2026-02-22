import * as TE from "fp-ts/TaskEither";

/**
 * Notification data structure
 */
export interface NotificationPayload {
  readonly title: string;
  readonly body: string;
}

/**
 * Service Port: System Notifications
 *
 * Defines contract for sending system notifications.
 * Implementations could use Tauri notification plugin, web Notification API, etc.
 */
export interface INotificationService {
  /**
   * Send a system notification
   * @returns TaskEither with error message on left, void on success
   */
  send(notification: NotificationPayload): TE.TaskEither<string, void>;

  /**
   * Check if notification permission is granted
   * @returns TaskEither with error message on left, boolean on right
   */
  checkPermission(): TE.TaskEither<string, boolean>;

  /**
   * Request notification permission from user
   * @returns TaskEither with error message on left, boolean (granted) on right
   */
  requestPermission(): TE.TaskEither<string, boolean>;
}
