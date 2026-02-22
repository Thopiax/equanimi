/**
 * Tauri Event Payloads
 *
 * Type definitions for events emitted from Rust backend
 */

/**
 * Window position and size information
 */
export interface WindowPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly is_full_screen: boolean;
}

/**
 * Window change event payload
 * Emitted by Rust when active window changes (x-win polling)
 */
export interface WindowChangeEvent {
  /**
   * Name of the application (e.g., "Slack", "Chrome", "VSCode")
   */
  readonly app_name: string;

  /**
   * Window title
   */
  readonly window_title: string;

  /**
   * Timestamp when the window change was detected (milliseconds since epoch)
   */
  readonly timestamp: number;

  /**
   * Window position and size
   */
  readonly position: WindowPosition;
}
