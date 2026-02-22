import { observer } from "@legendapp/state/react";
import { motion } from "motion/react";
import { appState$ } from "../state/appState";

/**
 * Timer Widget Window
 *
 * Circular progress indicator near Mac notch.
 * Color-based only (no numbers).
 * Green when focused, red when drifted.
 */
export const TimerWidget = observer(function TimerWidget() {
  const visible = appState$.visualization.timer.visible.get();
  const progress = appState$.visualization.timer.progress.get();
  const state = appState$.visualization.timer.state.get();

  if (!visible) return null;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const color = state === "focused" ? "#22c55e" : "#ef4444";

  return (
    <div
      style={{
        width: "100px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="100" height="100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="8"
          opacity="0.3"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
});
