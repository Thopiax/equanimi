import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { ISessionRepository } from "../../infrastructure/ports/ISessionRepository";
import { IDriftEventRepository } from "../../infrastructure/ports/IDriftEventRepository";
import {
  FocusSession,
  createFocusSession,
  complete,
} from "../../domain/aggregates/FocusSession";
import { DriftEvent } from "../../domain/entities/DriftEvent";
import { checkForDrift } from "../../domain/services/DriftDetectionService";
import { InterventionProtocol } from "../../domain/valueObjects/InterventionProtocol";
import { InterventionOrchestrator } from "./InterventionOrchestrator";
import { Duration } from "@domain/valueObjects/Duration";

interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  is_full_screen: boolean;
}

/**
 * Application Service: Focus Session Management
 *
 * Orchestrates session lifecycle, drift detection, and window change handling.
 */
export class SessionService {
  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly driftEventRepo: IDriftEventRepository,
    private readonly interventionOrchestrator: InterventionOrchestrator
  ) {}

  /**
   * Start a new focus session
   * Ends any existing active session first
   */
  startSession({
    taskName,
    blocklist,
    interventionProtocol,
    sessionDuration,
  }: {
    taskName: string;
    blocklist: string[];
    interventionProtocol?: InterventionProtocol;
    sessionDuration?: O.Option<Duration>;
  }): TE.TaskEither<string, FocusSession> {
    return pipe(
      // End any active session first
      this.endActiveSession(),
      // Create new session
      TE.chainW(() =>
        pipe(
          createFocusSession(
            taskName,
            blocklist,
            interventionProtocol,
            sessionDuration
          ),
          E.fold(
            (error) => TE.left(error),
            (session) =>
              pipe(
                this.sessionRepo.save(session),
                TE.chainW(() =>
                  pipe(
                    // Start interventions (shows compass, commitment dialog if enabled)
                    this.interventionOrchestrator.onSessionStart(session),
                    TE.map(() => session)
                  )
                )
              )
          )
        )
      )
    );
  }

  /**
   * End the currently active session
   */
  endActiveSession(): TE.TaskEither<string, O.Option<FocusSession>> {
    return pipe(
      this.sessionRepo.findActive(),
      TE.chainW((maybeSession) =>
        pipe(
          maybeSession,
          O.fold(
            // No active session, nothing to do
            () => TE.right(O.none),
            // Complete and save the session
            (session) =>
              pipe(
                complete(session),
                E.fold(
                  (error) => TE.left(error),
                  (completedSession) =>
                    pipe(
                      this.sessionRepo.save(completedSession),
                      TE.chainW(() =>
                        pipe(
                          // End all interventions
                          this.interventionOrchestrator.onSessionEnd(),
                          TE.map(() => O.some(completedSession))
                        )
                      )
                    )
                )
              )
          )
        )
      )
    );
  }

  /**
   * Get the currently active session
   */
  getActiveSession(): TE.TaskEither<string, O.Option<FocusSession>> {
    return this.sessionRepo.findActive();
  }

  /**
   * Get all sessions (history)
   */
  getAllSessions(): TE.TaskEither<string, readonly FocusSession[]> {
    return this.sessionRepo.findAll();
  }

  /**
   * Handle window change event - core drift detection logic
   * Called when user switches to a different app
   *
   * @param currentApp - Name of the app user switched to
   * @param position - Window position information
   * @returns Option<DriftEvent> if drift was detected and handled
   */
  handleWindowChange(
    currentApp: string,
    position?: WindowPosition
  ): TE.TaskEither<string, O.Option<DriftEvent>> {
    return pipe(
      // Get active session
      this.getActiveSession(),
      TE.chainW((maybeSession) =>
        pipe(
          maybeSession,
          O.fold(
            // No session, nothing to do
            () => TE.right(O.none),
            (session) => {
              // Check for drift using domain service
              const maybeDrift = checkForDrift(currentApp, O.some(session));

              return pipe(
                maybeDrift,
                O.fold(
                  // No drift - drift cleared
                  () =>
                    pipe(
                      this.interventionOrchestrator.onDriftCleared(session),
                      TE.map(() => O.none)
                    ),
                  // Drift detected
                  (driftEvent) =>
                    pipe(
                      // Save drift event
                      this.driftEventRepo.save(driftEvent),
                      TE.chainW(() =>
                        pipe(
                          // Trigger interventions
                          this.interventionOrchestrator.onDriftDetected(
                            session,
                            driftEvent,
                            position
                              ? {
                                  x: position.x,
                                  y: position.y,
                                  width: position.width,
                                  height: position.height,
                                }
                              : undefined
                          ),
                          TE.map(() => O.some(driftEvent)),
                          // Ignore intervention errors - still return drift event
                          TE.orElse(() => TE.right(O.some(driftEvent)))
                        )
                      )
                    )
                )
              );
            }
          )
        )
      )
    );
  }

  /**
   * Get drift events for a session
   */
  getSessionDriftEvents(
    sessionId: string
  ): TE.TaskEither<string, readonly DriftEvent[]> {
    return this.driftEventRepo.findBySessionId(sessionId);
  }
}
