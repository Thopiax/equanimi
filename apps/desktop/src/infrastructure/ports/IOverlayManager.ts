import * as TE from "fp-ts/TaskEither";

/**
 * Compass HUD state
 */
export interface CompassState {
  readonly progress: number; // 0-100
  readonly state: "focused" | "drifted";
}

/**
 * Stain overlay state
 */
export interface StainState {
  readonly progress: number; // 0-100
  readonly mode: "fullscreen" | "windowed";
  readonly targetBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Port: Overlay Window Manager
 *
 * Generic overlay operations for compass, stain, and capture windows.
 * Replaces the hardcoded IWindowManager with composable operations.
 */
export interface IOverlayManager {
  /**
   * Show compass HUD overlay
   * Auto-positions near center-top (near notch on newer MacBooks)
   */
  showCompass(initialProgress: number): TE.TaskEither<string, void>;

  /**
   * Update compass HUD state
   */
  updateCompass(state: CompassState): TE.TaskEither<string, void>;

  /**
   * Hide compass HUD
   */
  hideCompass(): TE.TaskEither<string, void>;

  /**
   * Show stain overlay (kept for future use, disabled by default)
   */
  showStain(state: StainState): TE.TaskEither<string, void>;

  /**
   * Update stain progress (0-100)
   */
  updateStain(progress: number): TE.TaskEither<string, void>;

  /**
   * Hide stain overlay
   */
  hideStain(): TE.TaskEither<string, void>;

  /**
   * Show capture modal
   */
  showCapture(): TE.TaskEither<string, void>;

  /**
   * Hide capture modal
   */
  hideCapture(): TE.TaskEither<string, void>;
}
