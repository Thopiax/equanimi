import { observer } from "@legendapp/state/react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useWindowTracking } from "./hooks/useWindowTracking";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useLocalShortcuts } from "./hooks/useLocalShortcuts";
import { useTrayIcon } from "./hooks/useTrayIcon";
import { appState$ } from "./state/appState";
import { IdleState } from "./components/IdleState";
import { Navigation } from "./components/Navigation";
import { PreferencesPane } from "./windows/PreferencesPane";
import { Window } from "@tauri-apps/api/window";
import "./App.css";

/**
 * Main Panel Window Component
 *
 * The primary menubar panel showing session state and controls.
 *
 * Simplified UX Philosophy:
 * - IDLE STATE: Big Red Button interface (TimeDurationSelector + BigRedButton)
 * - ACTIVE STATE: Navigation component (session in progress)
 * - OVERLAYS: Waypoint (capture modal) + DriftNotice (drift alerts)
 *
 * Removed complexity:
 * - SetNorth component (replaced by IdleState with sensible defaults)
 * - SetNorthModal (no intention setting in v1)
 * - Complex form validation and configuration
 */
const MainPanel = observer(function MainPanel() {
  // Initialize core functionality
  useWindowTracking();
  useGlobalShortcuts();
  useLocalShortcuts();
  useTrayIcon();

  // Initialize popover and window tracking on mount
  useEffect(() => {
    invoke("start_tracking").catch(console.error);
  }, []);

  const session = appState$.currentSession.get();

  return <div>{session ? <Navigation /> : <IdleState />}</div>;
});

/**
 * App Router Component
 *
 * Routes to the appropriate window component based on URL hash.
 */
export const App = observer(function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleAlwaysOnTop = async () => {
    const window = await Window.getByLabel("main");
    console.log("Main window initialized:", window);
    window?.setVisibleOnAllWorkspaces(true);
    window?.setAlwaysOnTop(true);
  };

  useEffect(() => {
    handleAlwaysOnTop().catch(console.error);
  }, []);

  // Route based on hash
  if (route === "#preferences") {
    return <PreferencesPane />;
  }

  return <MainPanel />;
});
