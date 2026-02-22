import * as TE from "fp-ts/TaskEither";

/**
 * Port: Dialog Service
 *
 * Native dialog operations using Tauri dialog plugin.
 * Used for behavioral contract interventions (BCT 1.8).
 */
export interface IDialogService {
  /**
   * Show commitment confirmation dialog at session start
   * Implements BCT 1.8 (Behavioral contract)
   *
   * @param taskName - The task the user is committing to
   * @returns True if user commits, false if cancelled
   */
  showCommitmentDialog(taskName: string): TE.TaskEither<string, boolean>;

  /**
   * Show generic confirmation dialog
   */
  confirm(title: string, message: string): TE.TaskEither<string, boolean>;

  /**
   * Show generic message dialog
   */
  message(title: string, message: string): TE.TaskEither<string, void>;
}
