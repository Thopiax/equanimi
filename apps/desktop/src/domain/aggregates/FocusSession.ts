import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { createAppName, appNameMatches } from "../valueObjects/AppName";
import {
  between as durationBetween,
  Duration,
  fromMilliseconds,
  toMilliseconds,
} from "../valueObjects/Duration";
import {
  InterventionProtocol,
  defaultInterventionProtocol,
} from "../valueObjects/InterventionProtocol";

/**
 * Aggregate Root: FocusSession
 * Immutable focus session with pure business logic
 */
export type SessionStatus = "active" | "completed";

export interface FocusSession {
  readonly id: string;
  readonly taskName: string;
  readonly blocklist: readonly string[];
  readonly startedAt: Date;
  readonly endedAt: O.Option<Date>;
  readonly status: SessionStatus;
  readonly interventionProtocol: InterventionProtocol;
  readonly sessionDuration: O.Option<Duration>; // Max duration (Some = timeboxed, None = open-ended)
}

export const createFocusSession = (
  taskName: string,
  blocklist: string[],
  interventionProtocol?: InterventionProtocol,
  sessionDuration: O.Option<Duration> = O.some(fromMilliseconds(90 * 60 * 1000)) // Default 90 minutes
): E.Either<string, FocusSession> =>
  taskName.trim() === ""
    ? E.left("Task name cannot be empty")
    : E.right({
        id: crypto.randomUUID(),
        taskName: taskName.trim(),
        blocklist: blocklist.map((b) => b.trim().toLowerCase()),
        startedAt: new Date(),
        endedAt: O.none,
        status: "active",
        interventionProtocol:
          interventionProtocol ?? defaultInterventionProtocol(),
        sessionDuration,
      });

export const reconstitute = (props: {
  id: string;
  taskName: string;
  blocklist: string[];
  startedAt: Date | string;
  endedAt?: Date | string;
  status: SessionStatus;
  interventionProtocol: InterventionProtocol;
  sessionDuration?: Duration;
}): FocusSession => ({
  id: props.id,
  taskName: props.taskName,
  blocklist: props.blocklist,
  startedAt: new Date(props.startedAt),
  endedAt: pipe(
    O.fromNullable(props.endedAt),
    O.map((d: Date | string) => new Date(d))
  ),
  status: props.status,
  interventionProtocol: props.interventionProtocol,
  sessionDuration: O.fromNullable(props.sessionDuration),
});

// Business logic: Check if app is drifted
export const isDriftedApp =
  (session: FocusSession) =>
  (appName: string): boolean =>
    session.status === "active" &&
    session.blocklist.some((pattern) =>
      pipe(createAppName(appName), appNameMatches)(pattern)
    );

// Business logic: Complete session
export const complete = (
  session: FocusSession
): E.Either<string, FocusSession> =>
  session.status === "completed"
    ? E.left("Session already completed")
    : E.right({
        ...session,
        endedAt: O.some(new Date()),
        status: "completed",
      });

// Getters
export const getId = (session: FocusSession): string => session.id;
export const getTaskName = (session: FocusSession): string => session.taskName;
export const getBlocklist = (session: FocusSession): readonly string[] =>
  session.blocklist;
export const getStartedAt = (session: FocusSession): Date => session.startedAt;
export const getEndedAt = (session: FocusSession): O.Option<Date> =>
  session.endedAt;
export const getStatus = (session: FocusSession): SessionStatus =>
  session.status;
export const getInterventionProtocol = (
  session: FocusSession
): InterventionProtocol => session.interventionProtocol;
export const isActive = (session: FocusSession): boolean =>
  session.status === "active";

export const getDuration = (session: FocusSession): O.Option<Duration> =>
  pipe(
    session.endedAt,
    O.map((endedAt) => durationBetween(session.startedAt, endedAt))
  );

/**
 * Get remaining time in session (for timeboxed sessions)
 * Returns None if session is open-ended or already ended
 */
export const getRemainingTime = (session: FocusSession): O.Option<Duration> =>
  pipe(
    session.sessionDuration,
    O.chain((dur) => {
      if (O.isSome(session.endedAt)) return O.none;

      const elapsed = Date.now() - session.startedAt.getTime();
      const totalMs = toMilliseconds(dur);
      const remaining = totalMs - elapsed;

      return remaining > 0 ? O.some(fromMilliseconds(remaining)) : O.none;
    })
  );

/**
 * Get session progress as percentage (0-100)
 * Returns 0 if open-ended
 */
export const getProgress = (session: FocusSession): number =>
  pipe(
    session.sessionDuration,
    O.fold(
      () => 0, // Open-ended
      (dur) => {
        const elapsed = Date.now() - session.startedAt.getTime();
        const total = toMilliseconds(dur);
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
      }
    )
  );

/**
 * Format remaining time as human-readable string
 * Returns null if no remaining time (open-ended or ended)
 *
 * Examples: "45 minutes", "2h 15m", "1 hour"
 */
export const formatRemainingTime = (session: FocusSession): string | null =>
  pipe(
    getRemainingTime(session),
    O.map((duration) => {
      const remainingMs = toMilliseconds(duration);

      if (remainingMs <= 0) {
        return "Session ended";
      }

      const remainingMinutes = Math.ceil(remainingMs / 60000);

      if (remainingMinutes >= 60) {
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;

        if (minutes === 0) {
          return `${hours} ${hours === 1 ? "hour" : "hours"}`;
        }
        return `${hours}h ${minutes}m`;
      }

      return `${remainingMinutes} ${
        remainingMinutes === 1 ? "minute" : "minutes"
      }`;
    }),
    O.toNullable
  );
