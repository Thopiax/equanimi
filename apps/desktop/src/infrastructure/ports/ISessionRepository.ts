import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import { FocusSession } from "../../domain/aggregates/FocusSession";

/**
 * Repository Port: Session Persistence
 *
 * Defines contract for session storage without specifying implementation.
 * Implementations could use IndexedDB, Tauri Store, localStorage, etc.
 */
export interface ISessionRepository {
  /**
   * Persist a session (create or update)
   * @returns TaskEither with error message on left, void on success
   */
  save(session: FocusSession): TE.TaskEither<string, void>;

  /**
   * Find session by ID
   * @returns TaskEither with error message on left, Option<Session> on right
   */
  findById(id: string): TE.TaskEither<string, O.Option<FocusSession>>;

  /**
   * Find the currently active session
   * @returns TaskEither with error message on left, Option<Session> on right
   */
  findActive(): TE.TaskEither<string, O.Option<FocusSession>>;

  /**
   * Find all sessions (ordered by startedAt desc)
   * @returns TaskEither with error message on left, array of sessions on right
   */
  findAll(): TE.TaskEither<string, readonly FocusSession[]>;
}
