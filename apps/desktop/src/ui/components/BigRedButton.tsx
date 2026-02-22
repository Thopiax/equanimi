import { observer } from "@legendapp/state/react";
import { useState } from "react";

interface BigRedButtonProps {
  durationMinutes: number;
  onPress: () => Promise<void>;
  disabled?: boolean;
}

export const BigRedButton = observer(function BigRedButton({
  durationMinutes,
  onPress,
  disabled = false,
}: BigRedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = async () => {
    if (disabled || isPressed) return;

    setIsPressed(true);
    try {
      await onPress();
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsPressed(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = minutes / 60;
    return hours === 1 ? "1hr" : `${hours}hrs`;
  };

  return (
    <button
      className={`
        relative w-60 h-60 border-none bg-transparent cursor-pointer p-0
        transition-transform duration-150 ease-out outline-none
        hover:scale-105 active:scale-95
        ${isPressed ? "opacity-70 cursor-wait" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={handleClick}
      disabled={disabled || isPressed}
      aria-label={`Begin ${formatDuration(durationMinutes)} focus session`}
      type="button"
    >
      <img
        src="/tray_idle.png"
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200 hover:rotate-2"
        aria-hidden="true"
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-lg font-semibold tracking-widest text-enso-cream uppercase text-center leading-tight">
          {isPressed ? "BEGINNING..." : "BEGIN FOCUS"}
        </span>
        <span className="text-sm font-normal text-enso-green tracking-wider">
          {formatDuration(durationMinutes)}
        </span>
      </div>
    </button>
  );
});
