import { observer } from "@legendapp/state/react";
import { useState, useEffect } from "react";
import { useServices } from "../hooks/useServices";
import { appState$ } from "../state/appState";
import { getStartedAt } from "../../domain/aggregates/FocusSession";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import * as O from "fp-ts/Option";
import * as Duration from "../../domain/valueObjects/Duration";

export const Navigation = observer(function Navigation() {
  const services = useServices();
  const [isEnding, setIsEnding] = useState(false);
  const [percentage, setPercentage] = useState(100);

  const session = appState$.currentSession.get();

  useEffect(() => {
    if (!session) return;

    const startedAt = getStartedAt(session);
    const durationMs = O.getOrElse(() => 0)(
      O.map((d: Duration.Duration) => Duration.toMilliseconds(d))(
        session.sessionDuration
      )
    );

    if (durationMs === 0) return; // Open-ended session

    const endTime = new Date(startedAt).getTime() + durationMs;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percentRemaining = (remaining / durationMs) * 100;

      setPercentage(percentRemaining);

      if (remaining <= 0) {
        handleEndSession();
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return null;
  }

  const handleEndSession = async () => {
    setIsEnding(true);

    try {
      const result = await services.sessionService.endActiveSession()();

      if (result._tag === "Right") {
        appState$.currentSession.set(null);
        appState$.activeDrift.set(null);
      } else {
        console.error("Failed to end session:", result.left);
      }
    } catch (err) {
      console.error("Error ending session:", err);
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <button
        className="relative w-60 h-60 bg-transparent border-none cursor-pointer p-0 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleEndSession}
        disabled={isEnding}
        aria-label={`End focus session. ${percentage.toFixed(0)}% remaining`}
      >
        <div className="absolute inset-0">
          <CircularProgressbar
            value={percentage}
            strokeWidth={3}
            styles={buildStyles({
              pathColor: "#8B9D83",
              trailColor: "rgba(232, 220, 196, 0.2)",
              strokeLinecap: "round",
            })}
          />
        </div>

        <img
          src="/tray_active.png"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
          aria-hidden="true"
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-xs text-enso-green lowercase tracking-widest opacity-0 hover:opacity-100 transition-opacity duration-200">
            tap to end
          </div>
        </div>
      </button>
    </div>
  );
});
