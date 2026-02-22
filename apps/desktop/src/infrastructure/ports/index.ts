/**
 * Infrastructure Ports - Barrel Export
 *
 * All port interfaces (contracts) for external dependencies.
 * These define WHAT the infrastructure provides, not HOW.
 */

export type { ISessionRepository } from "./ISessionRepository";
export type { ICaptureRepository } from "./ICaptureRepository";
export type { IDriftEventRepository } from "./IDriftEventRepository";
export type {
  INotificationService,
  NotificationPayload,
} from "./INotificationService";
export type { IConfigRepository } from "./IConfigRepository";
