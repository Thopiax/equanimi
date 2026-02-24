import { signalEnabled, signalSetting } from "@/utils/storage";
import { youtubeWatchTime } from "@/modules/signals/youtube-watch-time/definition";
import "./style.css";

/**
 * Content script: Watch Time Signal
 *
 * A self-monitoring signal that accumulates daily YouTube **playback** time.
 *
 * - Only counts seconds when a <video> element is actively playing.
 * - Persists accumulated seconds in extension storage (survives navigation).
 * - Uses MutationObserver to track videos across YouTube's SPA navigation.
 * - Resets at the start of each calendar day.
 * - Shows a timer counter (configurable corner position).
 * - Applies a growing dark blob over the video that starts small and
 *   expands to cover ~55% of the player. Position is random per page load.
 *
 * The blob never fully covers the player. Compass, not cage.
 */

const CSS_CLASS = `equanimi-${youtubeWatchTime.id}-active`;
const enabled = signalEnabled(
  youtubeWatchTime.id,
  youtubeWatchTime.defaultEnabled,
);

export type WatchTimePosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

const positionStore = signalSetting<WatchTimePosition>(
  youtubeWatchTime.id,
  "position",
  "bottom-right",
);

// ── Persisted daily accumulator ───────────────────────────────────
const dailySecondsStore = signalSetting<number>(
  youtubeWatchTime.id,
  "daily-seconds",
  0,
);
const dailyDateStore = signalSetting<string>(
  youtubeWatchTime.id,
  "daily-date",
  "",
);

// ── Configurable tunnel time range ───────────────────────────────
//
// The tunnel is invisible before `minMinutes` of watch time,
// then grows asymptotically toward ~95% intensity at `maxMinutes`.
//
// τ is derived: τ = (max − min) × 60 / −ln(0.05)
//   so the curve reaches ~95% right at maxMinutes.
//   It never fully closes — compass, not cage.
//
export const tunnelMinStore = signalSetting<number>(
  youtubeWatchTime.id,
  "tunnel-min-minutes",
  5, // tunnel starts at 5 minutes of watch time
);
export const tunnelMaxStore = signalSetting<number>(
  youtubeWatchTime.id,
  "tunnel-max-minutes",
  60, // tunnel is ~95% closed at 60 minutes
);

export const stainEnabledStore = signalSetting<boolean>(
  youtubeWatchTime.id,
  "stain-enabled",
  true,
);

// Derived at activation; re-derived when settings change.
const NEAR_MAX = -Math.log(0.05); // ≈ 2.996 — curve reaches 95% at 1× range
let tunnelMinSeconds = 5 * 60;
let tunnelMaxSeconds = 60 * 60;
let tau = (tunnelMaxSeconds - tunnelMinSeconds) / NEAR_MAX;

function deriveTau(minMin: number, maxMin: number): void {
  tunnelMinSeconds = minMin * 60;
  tunnelMaxSeconds = Math.max(minMin + 1, maxMin) * 60; // guard: max > min
  tau = (tunnelMaxSeconds - tunnelMinSeconds) / NEAR_MAX;
}

// Blob: a dark circle that grows over the video
const BLOB_SIZE_MIN = 3; // % of player width at t≈0 (tiny dot)
const BLOB_SIZE_MAX = 70; // % of player width at t→∞ (covers most of player)
const BLOB_ALPHA_MIN = 0.6; // core opacity at t≈0
const BLOB_ALPHA_MAX = 0.99; // core opacity at t→∞

// Random blob position (re-randomized each time the stain activates)
let blobX = 50;
let blobY = 50;

function randomizeBlobPosition(): void {
  // Keep center within the middle 60% of the player so it doesn't hug edges
  blobX = 20 + Math.random() * 60;
  blobY = 20 + Math.random() * 60;
}

// Counter also grows continuously
const COUNTER_FONT_MIN = 13;
const COUNTER_FONT_MAX = 18;

const SAVE_INTERVAL = 10; // persist to storage every N seconds

export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  runAt: "document_idle",

  async main() {
    const isEnabled = await enabled.getValue();
    if (isEnabled) await activate();

    enabled.watch(async (newValue) => {
      if (newValue) await activate();
      else deactivate();
    });

    positionStore.watch((newPosition) => {
      if (counterEl) counterEl.dataset.position = newPosition;
    });
  },
});

// ── State ─────────────────────────────────────────────────────────

let active = false;
let stainActive = false;
let dailySeconds = 0;
let videoPlaying = false;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let counterEl: HTMLElement | null = null;
let stainEl: HTMLElement | null = null;
let videoObserver: MutationObserver | null = null;
const trackedVideos = new WeakSet<HTMLVideoElement>();

// ── Lifecycle ─────────────────────────────────────────────────────

async function activate(): Promise<void> {
  if (active) return;
  active = true;

  // Load tunnel time-range settings and derive τ.
  const minMin = await tunnelMinStore.getValue();
  const maxMin = await tunnelMaxStore.getValue();
  deriveTau(minMin, maxMin);

  // Re-derive τ live when settings change in the manage page.
  tunnelMinStore.watch(async (newMin) => {
    deriveTau(newMin, await tunnelMaxStore.getValue());
    updateDisplay();
  });
  tunnelMaxStore.watch(async (newMax) => {
    deriveTau(await tunnelMinStore.getValue(), newMax);
    updateDisplay();
  });

  stainEnabledStore.watch((newValue) => {
    if (newValue) {
      activateStain();
    } else {
      deactivateStain();
    }
  });

  // Load persisted daily total (reset if new calendar day).
  const today = todayDateString();
  const storedDate = await dailyDateStore.getValue();

  if (storedDate === today) {
    dailySeconds = await dailySecondsStore.getValue();
  } else {
    dailySeconds = 0;
    await dailyDateStore.setValue(today);
    await dailySecondsStore.setValue(0);
  }

  document.documentElement.classList.add(CSS_CLASS);
  await createOverlay();
  updateDisplay();
  watchVideos();
  tickInterval = setInterval(tick, 1000);

  document.addEventListener("visibilitychange", handleVisibility);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  window.addEventListener("beforeunload", persistNow);
}

function deactivate(): void {
  if (!active) return;
  active = false;

  dailySecondsStore.setValue(dailySeconds);

  document.documentElement.classList.remove(CSS_CLASS);
  removeOverlay();
  unwatchVideos();

  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  document.removeEventListener("visibilitychange", handleVisibility);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  window.removeEventListener("beforeunload", persistNow);
}

// ── Video playback tracking ───────────────────────────────────────

function watchVideos(): void {
  // Attach to any existing <video> elements.
  for (const video of document.querySelectorAll("video")) {
    attachVideoListeners(video as HTMLVideoElement);
  }

  // YouTube is an SPA — new <video> elements appear on navigation.
  videoObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLVideoElement) {
          attachVideoListeners(node);
        }
        if (node instanceof HTMLElement) {
          for (const video of node.querySelectorAll("video")) {
            attachVideoListeners(video as HTMLVideoElement);
          }
        }
      }
    }
  });
  videoObserver.observe(document.body, { childList: true, subtree: true });
}

function unwatchVideos(): void {
  videoObserver?.disconnect();
  videoObserver = null;
  videoPlaying = false;
}

function attachVideoListeners(video: HTMLVideoElement): void {
  if (trackedVideos.has(video)) return;
  trackedVideos.add(video);

  const updateState = () => {
    // Any <video> on the page playing → count time.
    videoPlaying = Array.from(document.querySelectorAll("video")).some(
      (v) => !v.paused && !v.ended,
    );
  };

  video.addEventListener("play", updateState);
  video.addEventListener("pause", updateState);
  video.addEventListener("ended", updateState);

  // Video might already be playing when we attach.
  updateState();
}

// ── DOM ───────────────────────────────────────────────────────────

/** YouTube's player container — the stain lives inside it so it
 *  renders above the <video> (same stacking context). */
const PLAYER_SELECTOR = "#movie_player";

function findPlayerContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(PLAYER_SELECTOR);
}

async function createOverlay(): Promise<void> {
  const position = await positionStore.getValue();

  // Counter lives on body — visible in the page corner at all times.
  counterEl = document.createElement("div");
  counterEl.className = "equanimi-watch-counter";
  counterEl.textContent = "0:00";
  counterEl.dataset.position = position;
  document.body.appendChild(counterEl);

  // Stain creation depends on its own toggle.
  const stainOn = await stainEnabledStore.getValue();
  if (stainOn) {
    activateStain();
  }
}

function activateStain(): void {
  if (stainActive || !active) return;
  stainActive = true;
  randomizeBlobPosition();
  stainEl = document.createElement("div");
  stainEl.className = "equanimi-watch-stain";
  stainEl.style.left = `${blobX}%`;
  stainEl.style.top = `${blobY}%`;

  const player = findPlayerContainer();
  if (player) {
    player.appendChild(stainEl);
  } else {
    document.body.appendChild(stainEl);
    waitForPlayer();
  }
  updateDisplay();
}

function deactivateStain(): void {
  if (!stainActive) return;
  stainActive = false;
  stainEl?.remove();
  stainEl = null;
}

/** Poll for the player container if it wasn't available at startup. */
function waitForPlayer(): void {
  const observer = new MutationObserver(() => {
    const player = findPlayerContainer();
    if (player && stainEl) {
      player.appendChild(stainEl);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function removeOverlay(): void {
  counterEl?.remove();
  counterEl = null;
  deactivateStain();
}

// ── Timer tick ────────────────────────────────────────────────────

function tick(): void {
  if (!counterEl) return;

  // Only accumulate when a video is playing on a visible tab.
  if (!document.hidden && videoPlaying) {
    dailySeconds++;

    if (dailySeconds % SAVE_INTERVAL === 0) {
      dailySecondsStore.setValue(dailySeconds);
    }
  }

  updateDisplay();
}

function updateDisplay(): void {
  if (!counterEl) return;

  // ── Counter text ────────────────────────────────────────────
  const hours = Math.floor(dailySeconds / 3600);
  const minutes = Math.floor((dailySeconds % 3600) / 60);
  const seconds = dailySeconds % 60;

  counterEl.textContent =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // ── Stain interpolation — only if stain is active ──────────
  const t = stainProgress(dailySeconds);

  if (stainEl) {
    if (t <= 0) {
      stainEl.style.width = "0";
      stainEl.style.paddingBottom = "0";
      stainEl.style.opacity = "0";
    } else {
      const size = lerp(BLOB_SIZE_MIN, BLOB_SIZE_MAX, t);
      const alpha = lerp(BLOB_ALPHA_MIN, BLOB_ALPHA_MAX, t);
      const edgeAlpha = alpha * 0.5;

      stainEl.style.width = `${size.toFixed(1)}%`;
      stainEl.style.paddingBottom = `${size.toFixed(1)}%`;
      stainEl.style.opacity = "1";
      stainEl.style.background = [
        `radial-gradient(circle,`,
        `  rgba(0, 0, 0, ${alpha.toFixed(3)}) 0%,`,
        `  rgba(0, 0, 0, ${alpha.toFixed(3)}) 40%,`,
        `  rgba(0, 0, 0, ${edgeAlpha.toFixed(3)}) 70%,`,
        `  transparent 100%)`,
      ].join(" ");
    }
  }

  // ── Counter styling — grows with time ─────────────────────
  const fontSize = lerp(COUNTER_FONT_MIN, COUNTER_FONT_MAX, t);
  const textAlpha = lerp(0.55, 1.0, t);
  const bgAlpha = lerp(0.3, 0.55, t);

  counterEl.style.fontSize = `${fontSize.toFixed(1)}px`;
  counterEl.style.color = `rgba(255, 255, 255, ${textAlpha.toFixed(2)})`;
  counterEl.style.background = `rgba(0, 0, 0, ${bgAlpha.toFixed(2)})`;
  counterEl.style.padding = "6px 12px";
  counterEl.style.borderRadius = "8px";
  counterEl.style.fontWeight = t > 0.5 ? "600" : "400";
}

// ── Interpolation helpers ─────────────────────────────────────────

/** Tunnel progress: 0 before min, then asymptotic toward ~95% at max. */
function stainProgress(seconds: number): number {
  if (seconds < tunnelMinSeconds) return 0;
  const elapsed = seconds - tunnelMinSeconds;
  return 1 - Math.exp(-elapsed / tau);
}

/** Linear interpolation between two values. */
function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

// ── Fullscreen support ────────────────────────────────────────────
//
// The stain already lives inside #movie_player, so when YouTube
// fullscreens the player it comes along for free. We only need to
// re-parent the *counter* (which lives on <body>) into the fullscreen
// element so it stays visible, then move it back on exit.

function handleFullscreenChange(): void {
  if (!counterEl) return;

  if (document.fullscreenElement) {
    document.fullscreenElement.appendChild(counterEl);
  } else {
    document.body.appendChild(counterEl);
  }
}

// ── Visibility / persistence ──────────────────────────────────────

async function handleVisibility(): Promise<void> {
  if (document.hidden) {
    dailySecondsStore.setValue(dailySeconds);
  } else {
    // Catch up with time accumulated by other tabs while we were hidden.
    const stored = await dailySecondsStore.getValue();
    if (stored > dailySeconds) {
      dailySeconds = stored;
      updateDisplay();
    }
  }
}

function persistNow(): void {
  dailySecondsStore.setValue(dailySeconds);
}

// ── Helpers ───────────────────────────────────────────────────────

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
