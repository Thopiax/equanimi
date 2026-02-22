import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ask, message as showMessage } from "@tauri-apps/plugin-dialog";
import { IDialogService } from "../ports/IDialogService";

/**
 * Tauri Dialog Adapter
 *
 * Implements dialog interventions using Tauri's native dialog plugin.
 * Used for behavioral contract interventions (BCT 1.8).
 */
export class TauriDialogAdapter implements IDialogService {
  showCommitmentDialog(taskName: string): TE.TaskEither<string, boolean> {
    return pipe(
      TE.tryCatch(
        async () => {
          return await ask(
            `Ready to focus on: ${taskName}?\n\nPressing "Commit" is your commitment to stay on course.`,
            {
              title: "Begin Navigation",
              kind: "info",
              okLabel: "Commit",
              cancelLabel: "Cancel",
            }
          );
        },
        (error) => `Commitment dialog failed: ${String(error)}`
      )
    );
  }

  confirm(title: string, message: string): TE.TaskEither<string, boolean> {
    return pipe(
      TE.tryCatch(
        async () => await ask(message, { title, kind: "info" }),
        (error) => `Confirm dialog failed: ${String(error)}`
      )
    );
  }

  message(title: string, messageText: string): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          await showMessage(messageText, { title, kind: "info" });
        },
        (error) => `Message dialog failed: ${String(error)}`
      )
    );
  }
}
