import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IIntervention, InterventionContext } from "./IIntervention";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { INTERVENTION_METADATA } from "../valueObjects/InterventionMetadata";
import { IDialogService } from "../../infrastructure/ports/IDialogService";

/**
 * Commitment Dialog Intervention (Domain Service)
 *
 * Interactive dialog for commitment at session start.
 * Creates a behavioral contract before beginning focus session.
 *
 * Implements:
 * - BCT 1.8: Behavioral contract
 * - BCT 1.4: Action planning
 * - PDP: Suggestion
 *
 * Mechanisms of Action: Behavioral Regulation, Goals
 */
export class CommitmentDialog implements IIntervention {
  constructor(private readonly dialogService: IDialogService) {}

  /**
   * Not executed on drift - only used at session start
   */
  execute(
    _config: InterventionConfig,
    _context: InterventionContext
  ): TE.TaskEither<string, void> {
    return TE.right(void 0);
  }

  /**
   * Show commitment dialog when session starts
   */
  onSessionStart(context: InterventionContext): TE.TaskEither<string, void> {
    return pipe(
      this.dialogService.showCommitmentDialog(context.session.taskName),
      TE.chainW((committed) => {
        if (!committed) {
          return TE.left("User cancelled session commitment");
        }
        return TE.right(void 0);
      })
    );
  }

  /**
   * Get BCT/PDP metadata
   */
  getMetadata() {
    return INTERVENTION_METADATA.dialog;
  }
}
