import { observer } from "@legendapp/state/react";
import { useState } from "react";
import { useServices } from "../hooks/useServices";
import { appState$ } from "../state/appState";
import { BigRedButton } from "./BigRedButton";
import { TimeDurationSelector } from "./TimeDurationSelector";
import * as O from "fp-ts/Option";
import { fromMinutes } from "@domain/valueObjects/Duration";

export const IdleState = observer(function IdleState() {
  const services = useServices();
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const handleBeginFocus = async () => {
    setError(null);

    try {
      const defaultBlocklist = [
        "slack",
        "discord",
        "twitter",
        "facebook",
        "instagram",
        "reddit",
        "youtube",
        "netflix",
      ];

      const result = await services.sessionService.startSession({
        taskName: `Focus Session (${durationMinutes}min)`,
        blocklist: defaultBlocklist,
        sessionDuration: O.some(fromMinutes(durationMinutes)),
      })();

      if (result._tag === "Right") {
        appState$.currentSession.set(result.right);
      } else {
        setError(result.left);
      }
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center gap-6">
        <TimeDurationSelector
          value={durationMinutes}
          onChange={setDurationMinutes}
        />

        <BigRedButton
          durationMinutes={durationMinutes}
          onPress={handleBeginFocus}
        />
      </div>

      {error && (
        <div
          className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between gap-4"
          role="alert"
        >
          <p className="text-red-400 text-sm">{error}</p>
          <button
            className="text-red-400 hover:text-red-300 text-xl leading-none"
            onClick={() => setError(null)}
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
});
