import * as TE from "fp-ts/TaskEither";
import { Capture } from "../../domain/entities/Capture";

/**
 * Repository Port: Capture Persistence
 *
 * Defines contract for waypoint capture storage.
 */
export interface ICaptureRepository {
  /**
   * Persist a capture
   * @returns TaskEither with error message on left, void on success
   */
  save(capture: Capture): TE.TaskEither<string, void>;

  /**
   * Find all captures (ordered by capturedAt desc)
   * @returns TaskEither with error message on left, array of captures on right
   */
  findAll(): TE.TaskEither<string, readonly Capture[]>;

  /**
   * Find captures for a specific session
   * @returns TaskEither with error message on left, array of captures on right
   */
  findBySessionId(sessionId: string): TE.TaskEither<string, readonly Capture[]>;
}
