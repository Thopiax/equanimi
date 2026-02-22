import { useState, useRef, useEffect } from "react";

interface ShortcutRecorderProps {
  value: string;
  onChange: (shortcut: string) => void;
  placeholder?: string;
}

/**
 * Shortcut Recorder Component
 *
 * Records keyboard shortcuts by capturing keypresses.
 * Click to focus, press desired key combination, displays formatted result.
 */
export function ShortcutRecorder({
  value,
  onChange,
  placeholder = "Click to record...",
}: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Build shortcut string from pressed keys
      const modifiers: string[] = [];

      if (e.metaKey) modifiers.push("CommandOrControl");
      if (e.ctrlKey && !e.metaKey) modifiers.push("Control");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");

      // Get the actual key (not modifier keys)
      let key = e.key;

      // Map special keys to Tauri format
      const keyMap: Record<string, string> = {
        " ": "Space",
        ArrowUp: "Up",
        ArrowDown: "Down",
        ArrowLeft: "Left",
        ArrowRight: "Right",
        Escape: "Escape",
        Enter: "Return",
        Backspace: "Backspace",
        Delete: "Delete",
        Tab: "Tab",
      };

      if (keyMap[key]) {
        key = keyMap[key];
      } else if (key.length === 1) {
        // Single character - uppercase it
        key = key.toUpperCase();
      } else if (key.startsWith("F") && !isNaN(Number(key.slice(1)))) {
        // Function keys (F1-F12)
        key = key;
      } else if (
        ["Meta", "Control", "Alt", "Shift"].includes(key)
      ) {
        // Modifier-only press - ignore
        return;
      }

      // Build final shortcut string
      const shortcut =
        modifiers.length > 0
          ? `${modifiers.join("+")}+${key}`
          : key;

      onChange(shortcut);
      setIsRecording(false);
      inputRef.current?.blur();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isRecording, onChange]);

  const handleFocus = () => {
    setIsRecording(true);
  };

  const handleBlur = () => {
    setIsRecording(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative">
      <div
        ref={inputRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-1.5 rounded border font-mono text-sm cursor-pointer
          ${isRecording ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}
          ${!value && !isRecording ? "text-gray-400" : "text-gray-900"}
        `}
      >
        {isRecording ? (
          <span className="text-blue-600">Press keys...</span>
        ) : value ? (
          <span>{value}</span>
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
      {value && !isRecording && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm px-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}
