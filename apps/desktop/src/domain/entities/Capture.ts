import * as O from "fp-ts/Option";

/**
 * Entity: Capture
 * Represents a waypoint thought capture
 */
export interface Capture {
  readonly id: string;
  readonly content: string;
  readonly capturedAt: Date;
  readonly sessionId: O.Option<string>;
}

export const createCapture = (
  content: string,
  sessionId?: string
): Capture => ({
  id: crypto.randomUUID(),
  content,
  capturedAt: new Date(),
  sessionId: O.fromNullable(sessionId),
});

export const reconstitute = (props: {
  id: string;
  content: string;
  capturedAt: Date | string;
  sessionId?: string;
}): Capture => ({
  id: props.id,
  content: props.content,
  capturedAt: new Date(props.capturedAt),
  sessionId: O.fromNullable(props.sessionId),
});

// Getters
export const getId = (capture: Capture): string => capture.id;
export const getContent = (capture: Capture): string => capture.content;
export const getCapturedAt = (capture: Capture): Date => capture.capturedAt;
export const getSessionId = (capture: Capture): O.Option<string> =>
  capture.sessionId;
