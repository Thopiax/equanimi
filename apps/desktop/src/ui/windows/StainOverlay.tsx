import { observer } from "@legendapp/state/react";
import { useEffect } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { appState$ } from "../state/appState";

/**
 * Stain Overlay Window
 *
 * Progressive borders-inward visual feedback during drift.
 * Grows from 0 to 100% over 120 seconds.
 * Adapts to fullscreen vs windowed mode.
 */
export const StainOverlay = observer(function StainOverlay() {
  const visible = appState$.visualization.stain.visible.get();
  const progress = appState$.visualization.stain.progress.get();

  const insetValue = useMotionValue(0);
  const opacityValue = useMotionValue(0);

  // Animate inset based on progress
  useEffect(() => {
    const targetInset = progress;
    animate(insetValue, targetInset, {
      duration: 0.3,
      ease: "easeIn",
    });

    const targetOpacity = (progress / 100) * 0.6;
    animate(opacityValue, targetOpacity, {
      duration: 0.3,
    });
  }, [progress, insetValue, opacityValue]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0.3) 100%)",
          filter: "blur(80px)",
          clipPath: `inset(${insetValue.get()}% ${insetValue.get()}% ${insetValue.get()}% ${insetValue.get()}%)`,
          opacity: opacityValue.get(),
        }}
      />
    </div>
  );
});
