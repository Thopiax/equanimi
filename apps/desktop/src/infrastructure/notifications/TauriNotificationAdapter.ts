import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  INotificationService,
  NotificationPayload,
} from "../ports/INotificationService";

/**
 * Tauri Notification Plugin implementation
 *
 * Wraps Tauri's notification plugin to send system notifications
 * Format: "🧭 Off Course\nYou're in {app}\nYour north: {task}"
 */
export class TauriNotificationAdapter implements INotificationService {
  send(notification: NotificationPayload): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          // Check permission first
          const granted = await isPermissionGranted();
          if (!granted) {
            throw new Error(
              "Notification permission not granted. Request permission first."
            );
          }

          // Send notification
          await sendNotification({
            title: notification.title,
            body: notification.body,
          });
        },
        (error) => `Failed to send notification: ${String(error)}`
      )
    );
  }

  checkPermission(): TE.TaskEither<string, boolean> {
    return pipe(
      TE.tryCatch(
        async () => {
          return await isPermissionGranted();
        },
        (error) => `Failed to check notification permission: ${String(error)}`
      )
    );
  }

  requestPermission(): TE.TaskEither<string, boolean> {
    return pipe(
      TE.tryCatch(
        async () => {
          const permission = await requestPermission();
          return permission === "granted";
        },
        (error) => `Failed to request notification permission: ${String(error)}`
      )
    );
  }
}
