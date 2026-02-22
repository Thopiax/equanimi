import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IIntervention, InterventionContext } from "./IIntervention";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { INTERVENTION_METADATA } from "../valueObjects/InterventionMetadata";
import { IOverlayManager } from "../../infrastructure/ports/IOverlayManager";

/**
 * Stain Intervention (Domain Service)
 *
 * Visual overlay that grows over time when drifted.
 * Provides progressive friction through visual punishment.
 * Disabled by default.
 *
 * Implements:
 * - BCT 14.2: Punishment
 * - PDP: Reduction
 *
 * Mechanisms of Action: Reinforcement, Attitude towards behavior
 */
export class Stain implements IIntervention {
  private stainProgressInterval: number | null = null;

  constructor(private readonly overlayManager: IOverlayManager) {}

  /**
   * Execute on drift - show stain and animate growth
   */
  execute(
    config: InterventionConfig,
    context: InterventionContext
  ): TE.TaskEither<string, void> {
    if (config.settings.type !== "stain") {
      return TE.right(void 0);
    }

    // Clear any existing animation to prevent memory leak
    this.clearAnimation();

    const mode = config.settings.mode;
    const targetBounds =
      mode === "windowed" && context.windowPosition
        ? context.windowPosition
        : undefined;

    // Show stain overlay
    return pipe(
      this.overlayManager.showStain({
        progress: 0,
        mode,
        targetBounds,
      }),
      TE.map(() => {
        // Animate progress over 120 seconds
        const startTime = Date.now();
        this.stainProgressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, (elapsed / 120000) * 100);
          this.overlayManager.updateStain(progress)();

          if (progress >= 100) {
            this.clearAnimation();
          }
        }, 100) as unknown as number;
      })
    );
  }

  /**
   * Clean up when drift is cleared
   */
  onDriftCleared(_context: InterventionContext): TE.TaskEither<string, void> {
    this.clearAnimation();
    return this.overlayManager.hideStain();
  }

  /**
   * Clean up when session ends
   */
  onSessionEnd(): TE.TaskEither<string, void> {
    this.clearAnimation();
    return this.overlayManager.hideStain();
  }

  /**
   * Get BCT/PDP metadata
   */
  getMetadata() {
    return INTERVENTION_METADATA.stain;
  }

  /**
   * Clear animation interval
   */
  private clearAnimation(): void {
    if (this.stainProgressInterval) {
      clearInterval(this.stainProgressInterval);
      this.stainProgressInterval = null;
    }
  }
}
