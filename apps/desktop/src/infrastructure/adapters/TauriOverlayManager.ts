import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor } from "@tauri-apps/api/window";
import {
  IOverlayManager,
  CompassState,
  StainState,
} from "../ports/IOverlayManager";
import { appState$ } from "../../ui/state/appState";

/**
 * Tauri Overlay Manager Adapter
 *
 * Generic overlay management using Tauri WebviewWindow API.
 * Replaces hardcoded window-specific methods with composable operations.
 *
 * Windows are dynamically created (like preferences) instead of pre-declared.
 */
export class TauriOverlayManager implements IOverlayManager {
  // Compass widget
  showCompass(initialProgress: number): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          // Cancel pending destroy timer
          const timerId = appState$.visualization.timer.destroyTimer.get();
          if (timerId) {
            clearTimeout(timerId);
            appState$.visualization.timer.destroyTimer.set(undefined);
          }

          // Get or create compass window (labeled "timer" for backwards compat)
          let window = await WebviewWindow.getByLabel("timer");

          if (!window) {
            // Auto-position near center top (near notch on newer MacBooks)
            const monitor = await currentMonitor();
            const screenWidth = monitor?.size.width ?? 1920;
            const x = Math.floor(screenWidth / 2 - 50);
            const y = 30;

            window = new WebviewWindow("timer", {
              url: "#timer",
              title: "",
              width: 100,
              height: 100,
              x,
              y,
              decorations: false,
              alwaysOnTop: true,
              skipTaskbar: true,
              visible: true,
              visibleOnAllWorkspaces: true,
            });
          } else {
            await window.show();
          }

          appState$.visualization.timer.visible.set(true);
          appState$.visualization.timer.progress.set(initialProgress);
        },
        (error) => `Failed to show compass: ${String(error)}`
      )
    );
  }

  updateCompass(state: CompassState): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          appState$.visualization.timer.progress.set(state.progress);
          appState$.visualization.timer.state.set(state.state);
        },
        (error) => `Failed to update compass: ${String(error)}`
      )
    );
  }

  hideCompass(): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          appState$.visualization.timer.visible.set(false);

          // Schedule destruction after 30s
          const timerId = setTimeout(async () => {
            const window = await WebviewWindow.getByLabel("timer");
            if (window) await window.close();
            appState$.visualization.timer.destroyTimer.set(undefined);
          }, 30000) as unknown as number;

          appState$.visualization.timer.destroyTimer.set(timerId);
        },
        (error) => `Failed to hide compass: ${String(error)}`
      )
    );
  }

  // Stain overlay (keep implementation, disabled by default)
  showStain(state: StainState): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const timerId = appState$.visualization.stain.destroyTimer.get();
          if (timerId) {
            clearTimeout(timerId);
            appState$.visualization.stain.destroyTimer.set(undefined);
          }

          let window = await WebviewWindow.getByLabel("stain");

          if (!window) {
            // Create stain window dynamically
            window = new WebviewWindow("stain", {
              url: "#stain",
              title: "",
              width:
                state.mode === "fullscreen"
                  ? 1920
                  : state.targetBounds?.width ?? 800,
              height:
                state.mode === "fullscreen"
                  ? 1080
                  : state.targetBounds?.height ?? 600,
              x: state.mode === "fullscreen" ? 0 : state.targetBounds?.x ?? 0,
              y: state.mode === "fullscreen" ? 0 : state.targetBounds?.y ?? 0,
              decorations: false,
              alwaysOnTop: true,
              skipTaskbar: true,
              transparent: true,
              visible: true,
            });

            await window.setIgnoreCursorEvents(true);
          } else {
            await window.show();
          }

          appState$.visualization.stain.visible.set(true);
          appState$.visualization.stain.progress.set(state.progress);
          appState$.visualization.stain.mode.set(state.mode);
          if (state.targetBounds) {
            appState$.visualization.stain.targetBounds.set(state.targetBounds);
          }
        },
        (error) => `Failed to show stain: ${String(error)}`
      )
    );
  }

  updateStain(progress: number): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          appState$.visualization.stain.progress.set(progress);
        },
        (error) => `Failed to update stain: ${String(error)}`
      )
    );
  }

  hideStain(): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          appState$.visualization.stain.visible.set(false);

          const timerId = setTimeout(async () => {
            const window = await WebviewWindow.getByLabel("stain");
            if (window) await window.close();
            appState$.visualization.stain.destroyTimer.set(undefined);
          }, 30000) as unknown as number;

          appState$.visualization.stain.destroyTimer.set(timerId);
        },
        (error) => `Failed to hide stain: ${String(error)}`
      )
    );
  }

  // Capture modal
  showCapture(): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const timerId = appState$.visualization.capture.destroyTimer.get();
          if (timerId) {
            clearTimeout(timerId);
            appState$.visualization.capture.destroyTimer.set(undefined);
          }

          let window = await WebviewWindow.getByLabel("capture");

          if (!window) {
            window = new WebviewWindow("capture", {
              url: "#capture",
              title: "Quick Capture",
              width: 500,
              height: 200,
              center: true,
              decorations: true,
              alwaysOnTop: true,
            });
          } else {
            await window.show();
            await window.setFocus();
          }

          appState$.visualization.capture.visible.set(true);
        },
        (error) => `Failed to show capture: ${String(error)}`
      )
    );
  }

  hideCapture(): TE.TaskEither<string, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          appState$.visualization.capture.visible.set(false);

          const timerId = setTimeout(async () => {
            const window = await WebviewWindow.getByLabel("capture");
            if (window) await window.close();
            appState$.visualization.capture.destroyTimer.set(undefined);
          }, 30000) as unknown as number;

          appState$.visualization.capture.destroyTimer.set(timerId);
        },
        (error) => `Failed to hide capture: ${String(error)}`
      )
    );
  }
}
