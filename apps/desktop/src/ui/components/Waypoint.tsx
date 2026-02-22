import { observer } from "@legendapp/state/react";
import { useState, useEffect, useRef } from "react";
import { useServices } from "../hooks/useServices";
import { appState$ } from "../state/appState";
import { getId } from "../../domain/aggregates/FocusSession";

/**
 * Waypoint Component - Capture Modal
 *
 * Opens with Cmd+Shift+C to capture quick thoughts.
 * Saves to current session (if active) or standalone.
 */
export const Waypoint = observer(function Waypoint() {
  const services = useServices();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = appState$.ui.showCaptureModal.get();
  const session = appState$.currentSession.get();

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    appState$.ui.showCaptureModal.set(false);
    setContent("");
  };

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      // Get session ID if session exists
      const sessionId = session ? getId(session) : undefined;

      // Create capture via service
      const result = await services.captureService.createCapture(
        content,
        sessionId
      )();

      if (result._tag === "Right") {
        handleClose();
      } else {
        console.error("Failed to save capture:", result.left);
      }
    } catch (err) {
      console.error("Error saving capture:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl+Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
    // Escape to close
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "#FAFAF9",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          Mark Waypoint
        </h2>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Capture a thought, insight, or note..."
          rows={6}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #D4D4D4",
            borderRadius: "8px",
            resize: "vertical",
            fontFamily: "inherit",
            marginBottom: "16px",
          }}
          disabled={isSaving}
        />

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={handleClose}
            disabled={isSaving}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              backgroundColor: "transparent",
              color: "#78716C",
              border: "1px solid #D4D4D4",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: content.trim() ? "#262626" : "#D4D4D4",
              color: "#FAFAF9",
              border: "none",
              borderRadius: "6px",
              cursor: content.trim() ? "pointer" : "not-allowed",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#A8A29E",
            textAlign: "center",
          }}
        >
          <kbd style={{ fontFamily: "monospace" }}>Cmd+Enter</kbd> to save •{" "}
          <kbd style={{ fontFamily: "monospace" }}>Esc</kbd> to cancel
        </p>
      </div>
    </div>
  );
});
