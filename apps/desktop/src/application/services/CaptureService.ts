import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ICaptureRepository } from "../../infrastructure/ports/ICaptureRepository";
import { Capture, createCapture } from "../../domain/entities/Capture";

/**
 * Application Service: Waypoint Capture Management
 *
 * Orchestrates capture creation and retrieval.
 */
export class CaptureService {
  constructor(private readonly captureRepo: ICaptureRepository) {}

  /**
   * Create a new waypoint capture
   * @param content - The capture content
   * @param sessionId - Optional session ID to associate capture with
   */
  createCapture(
    content: string,
    sessionId?: string
  ): TE.TaskEither<string, Capture> {
    return pipe(
      TE.right(createCapture(content, sessionId)),
      TE.chainW((capture) =>
        pipe(
          this.captureRepo.save(capture),
          TE.map(() => capture)
        )
      )
    );
  }

  /**
   * Get all captures (ordered by most recent first)
   */
  getAllCaptures(): TE.TaskEither<string, readonly Capture[]> {
    return this.captureRepo.findAll();
  }

  /**
   * Get captures for a specific session
   */
  getCapturesBySession(
    sessionId: string
  ): TE.TaskEither<string, readonly Capture[]> {
    return this.captureRepo.findBySessionId(sessionId);
  }
}
