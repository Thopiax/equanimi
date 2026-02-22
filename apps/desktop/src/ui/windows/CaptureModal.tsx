import { observer } from "@legendapp/state/react";
import { useState, useEffect, useRef } from "react";
import { appState$ } from "../state/appState";
import { useServices } from "../hooks/useServices";

/**
 * Capture Modal Window
 *
 * Quick idea capture triggered by Cmd+Shift+C.
 * Single input, autofocus, Enter saves, Esc dismisses.
 */
export const CaptureModal = observer(function CaptureModal() {
  const visible = appState$.visualization.capture.visible.get();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const services = useServices();

  // Autofocus when visible
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!text.trim()) return;

    const result = await services.captureService.createCapture(text)();
    if (result._tag === "Right") {
      setText("");
      appState$.visualization.capture.visible.set(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      appState$.visualization.capture.visible.set(false);
    }
  };

  return (
    <div
      style={{
        width: "500px",
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: "12px",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Capture a thought..."
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          outline: "none",
        }}
      />
    </div>
  );
});
