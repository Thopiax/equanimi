import * as TE from "fp-ts/TaskEither";
import { DriftEvent } from "../../domain/entities/DriftEvent";

/**
 * Repository Port: Drift Event Persistence
 *
 * Defines contract for drift event storage.
 */
export interface IDriftEventRepository {
  /**
   * Persist a drift event
   * @returns TaskEither with error message on left, void on success
   */
  save(event: DriftEvent): TE.TaskEither<string, void>;

  /**
   * Find all drift events for a specific session (ordered by detectedAt desc)
   * @returns TaskEither with error message on left, array of events on right
   */
  findBySessionId(
    sessionId: string
  ): TE.TaskEither<string, readonly DriftEvent[]>;
}
