import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

/**
 * Entity: DriftEvent
 * Represents a single drift occurrence
 */
export type DriftAction = "dismissed" | "ignored" | "returned";

export interface DriftEvent {
  readonly id: string;
  readonly sessionId: string;
  readonly appName: string;
  readonly detectedAt: Date;
  readonly dismissedAt: O.Option<Date>;
  readonly action: O.Option<DriftAction>;
}

export const createDriftEvent = (
  sessionId: string,
  appName: string
): DriftEvent => ({
  id: crypto.randomUUID(),
  sessionId,
  appName,
  detectedAt: new Date(),
  dismissedAt: O.none,
  action: O.none,
});

export const reconstitute = (props: {
  id: string;
  sessionId: string;
  appName: string;
  detectedAt: Date | string;
  dismissedAt?: Date | string;
  action?: DriftAction;
}): DriftEvent => ({
  id: props.id,
  sessionId: props.sessionId,
  appName: props.appName,
  detectedAt: new Date(props.detectedAt),
  dismissedAt: pipe(
    O.fromNullable(props.dismissedAt),
    O.map((d: Date | string) => new Date(d))
  ),
  action: O.fromNullable(props.action),
});

export const dismiss =
  (action: DriftAction) =>
  (event: DriftEvent): DriftEvent => ({
    ...event,
    dismissedAt: O.some(new Date()),
    action: O.some(action),
  });

// Getters
export const getId = (event: DriftEvent): string => event.id;
export const getSessionId = (event: DriftEvent): string => event.sessionId;
export const getAppName = (event: DriftEvent): string => event.appName;
export const getDetectedAt = (event: DriftEvent): Date => event.detectedAt;
export const isDismissed = (event: DriftEvent): boolean =>
  O.isSome(event.dismissedAt);
