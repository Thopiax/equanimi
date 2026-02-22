# NSPanel Overlay System - Design

**Date:** 2025-11-28
**Status:** Approved for implementation
**Pattern:** Full Handy Pattern (Rust-managed NSPanel windows)

---

## Requirements

### Priority
Overlay windows (timer/stain) are the primary focus. Main panel improvements are secondary.

### Constraints
1. **Fullscreen behavior:** Overlays MUST appear over fullscreen apps (critical for drift tracking)
2. **Multi-monitor:** Follow cursor to detect active monitor (no hardcoded positions)
3. **Z-order:** Stain (bottom) → Timer → Capture (top)
4. **Platform:** macOS primary, Windows/Linux fallback

### Success Criteria
- Timer widget visible during fullscreen work
- Stain overlay doesn't block timer
- Overlays appear on correct monitor automatically
- No flicker when showing/hiding

---

## Architecture

### Pattern
Rust-managed NSPanel windows with event-driven TypeScript coordination (Handy pattern).

### File Structure

```
src-tauri/src/
├── lib.rs                    # Entry point, add overlay module
├── windows/
│   ├── mod.rs               # Public API: create/show/hide functions
│   ├── panel_definitions.rs # NSPanel configs via tauri_panel! macro
│   ├── positioning.rs       # Cursor-based monitor detection
│   └── lifecycle.rs         # Window lifecycle (show/hide/emit events)
```

### Window Definitions

| Window | Type | Size | Position | Level | Behavior |
|--------|------|------|----------|-------|----------|
| **Timer** | NSPanel | 100x40px | Top-center of active monitor | Status (25) | `full_screen_auxiliary`, `can_join_all_spaces` |
| **Stain** | NSPanel | Full-screen | Covers entire active monitor | StatusPanel (24) | `full_screen_auxiliary`, `setIgnoreCursorEvents(true)` |
| **Capture** | NSPanel | 400x300px | Center of active monitor | ModalPanel (26) | Can become key window, takes focus |

**Z-order achieved via PanelLevel:**
- Stain: `PanelLevel::StatusPanel` (24)
- Timer: `PanelLevel::Status` (25)
- Capture: `PanelLevel::ModalPanel` (26)

---

## Dependencies

### New Cargo Dependencies

```toml
[dependencies]
enigo = "0.2"  # Cursor position detection
```

**Already have:** `tauri-nspanel`, `x-win`

---

## Implementation Details

### 1. Panel Definitions (`panel_definitions.rs`)

```rust
use tauri_nspanel::tauri_panel;

// Define all overlay panels
tauri_panel! {
    panel!(TimerPanel {
        config: {
            can_become_key_window: false,
            is_floating_panel: true
        }
    }),
    panel!(StainPanel {
        config: {
            can_become_key_window: false,
            is_floating_panel: true
        }
    }),
    panel!(CapturePanel {
        config: {
            can_become_key_window: true,  // Can receive keyboard input
            is_floating_panel: true
        }
    })
}
```

### 2. Monitor Detection (`positioning.rs`)

**Pattern:** Use `enigo` to get cursor position, iterate monitors to find match.

```rust
use enigo::{Enigo, Mouse};
use tauri::{AppHandle, Monitor, PhysicalPosition, PhysicalSize};

pub fn get_monitor_with_cursor(app: &AppHandle) -> Option<Monitor> {
    let enigo = Enigo::new(&Default::default()).ok()?;
    let (mouse_x, mouse_y) = enigo.location().ok()?;

    for monitor in app.available_monitors().ok()? {
        if is_within_monitor((mouse_x, mouse_y), &monitor) {
            return Some(monitor);
        }
    }

    app.primary_monitor().ok().flatten()
}

fn is_within_monitor(pos: (i32, i32), monitor: &Monitor) -> bool {
    let (mx, my) = pos;
    let mon_pos = monitor.position();
    let mon_size = monitor.size();

    mx >= mon_pos.x
        && mx < mon_pos.x + mon_size.width as i32
        && my >= mon_pos.y
        && my < mon_pos.y + mon_size.height as i32
}

pub fn calculate_timer_position(app: &AppHandle) -> Option<(f64, f64)> {
    let monitor = get_monitor_with_cursor(app)?;
    let work_area = monitor.work_area();
    let scale = monitor.scale_factor();

    let x = work_area.position.x as f64 / scale
        + (work_area.size.width as f64 / scale - 100.0) / 2.0;
    let y = work_area.position.y as f64 / scale + 30.0;  // Top offset

    Some((x, y))
}

pub fn calculate_stain_position(app: &AppHandle) -> Option<(f64, f64, f64, f64)> {
    let monitor = get_monitor_with_cursor(app)?;
    let work_area = monitor.work_area();
    let scale = monitor.scale_factor();

    let x = work_area.position.x as f64 / scale;
    let y = work_area.position.y as f64 / scale;
    let w = work_area.size.width as f64 / scale;
    let h = work_area.size.height as f64 / scale;

    Some((x, y, w, h))
}

pub fn calculate_capture_position(app: &AppHandle) -> Option<(f64, f64)> {
    let monitor = get_monitor_with_cursor(app)?;
    let work_area = monitor.work_area();
    let scale = monitor.scale_factor();

    let x = work_area.position.x as f64 / scale
        + (work_area.size.width as f64 / scale - 400.0) / 2.0;
    let y = work_area.position.y as f64 / scale
        + (work_area.size.height as f64 / scale - 300.0) / 2.0;

    Some((x, y))
}
```

### 3. Window Creation (`lifecycle.rs`)

**Platform-specific with conditional compilation:**

```rust
#[cfg(target_os = "macos")]
use tauri_nspanel::{PanelBuilder, PanelLevel, CollectionBehavior, WebviewUrl};

#[cfg(not(target_os = "macos"))]
use tauri::WebviewWindowBuilder;

// macOS implementation
#[cfg(target_os = "macos")]
pub fn create_timer_window(app: &AppHandle) -> Result<(), String> {
    let (x, y) = calculate_timer_position(app)
        .ok_or("Failed to calculate position")?;

    PanelBuilder::<_, TimerPanel>::new(app, "timer")
        .url(WebviewUrl::App("src/windows/timer.html".into()))
        .title("Timer")
        .position(tauri::Position::Logical(tauri::LogicalPosition { x, y }))
        .size(tauri::Size::Logical(tauri::LogicalSize {
            width: 100.0,
            height: 40.0
        }))
        .level(PanelLevel::Status)
        .transparent(true)
        .no_activate(true)
        .has_shadow(false)
        .collection_behavior(
            CollectionBehavior::new()
                .can_join_all_spaces()
                .full_screen_auxiliary()
        )
        .with_window(|w| w.decorations(false).transparent(true))
        .build()
        .map_err(|e| format!("Failed to create timer: {}", e))?;

    Ok(())
}

// Similar for create_stain_window and create_capture_window...

// Windows/Linux fallback
#[cfg(not(target_os = "macos"))]
pub fn create_timer_window(app: &AppHandle) -> Result<(), String> {
    let (x, y) = calculate_timer_position(app)
        .ok_or("Failed to calculate position")?;

    WebviewWindowBuilder::new(app, "timer", tauri::WebviewUrl::App("src/windows/timer.html".into()))
        .title("Timer")
        .position(x, y)
        .inner_size(100.0, 40.0)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build()
        .map_err(|e| format!("Failed to create timer: {}", e))?;

    Ok(())
}
```

### 4. Show/Hide Functions

**Pattern:** Update position before showing, emit event for animations, delay hide for transitions.

```rust
pub fn show_timer(app: &AppHandle) -> Result<(), String> {
    // 1. Update position
    if let Some((x, y)) = calculate_timer_position(app) {
        if let Some(window) = app.get_webview_window("timer") {
            window.set_position(tauri::Position::Logical(tauri::LogicalPosition { x, y }))
                .map_err(|e| format!("Position error: {}", e))?;
        }
    }

    // 2. Show window
    if let Some(window) = app.get_webview_window("timer") {
        window.show().map_err(|e| format!("Show error: {}", e))?;

        // 3. Emit event for React fade-in
        window.emit("show-timer", ()).ok();
    }

    Ok(())
}

pub fn hide_timer(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("timer") {
        // 1. Emit fade-out event
        window.emit("hide-timer", ()).ok();

        // 2. Delay hide for animation (300ms)
        let window_clone = window.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(300));
            let _ = window_clone.hide();
        });
    }

    Ok(())
}

// Stain requires setIgnoreCursorEvents
pub fn show_stain(app: &AppHandle) -> Result<(), String> {
    if let Some((x, y, w, h)) = calculate_stain_position(app) {
        if let Some(window) = app.get_webview_window("stain") {
            window.set_position(tauri::Position::Logical(tauri::LogicalPosition { x, y }))
                .map_err(|e| format!("Position error: {}", e))?;
            window.set_size(tauri::Size::Logical(tauri::LogicalSize { width: w, height: h }))
                .map_err(|e| format!("Size error: {}", e))?;
            window.set_ignore_cursor_events(true)
                .map_err(|e| format!("Cursor events error: {}", e))?;
            window.show().map_err(|e| format!("Show error: {}", e))?;
            window.emit("show-stain", ()).ok();
        }
    }

    Ok(())
}
```

### 5. Tauri Commands

```rust
#[tauri::command]
fn show_timer_window(app: AppHandle) -> Result<(), String> {
    windows::show_timer(&app)
}

#[tauri::command]
fn hide_timer_window(app: AppHandle) -> Result<(), String> {
    windows::hide_timer(&app)
}

// Similar for stain and capture...
```

### 6. Setup Hook

**Create windows on app startup (hidden):**

```rust
.setup(|app| {
    #[cfg(target_os = "macos")]
    let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    // Create overlay windows (hidden by default)
    windows::create_timer_window(app.handle())?;
    windows::create_stain_window(app.handle())?;
    windows::create_capture_window(app.handle())?;

    Ok(())
})
```

---

## TypeScript Integration

### Update TauriWindowManager

**Replace hardcoded positioning with Tauri commands:**

```typescript
import { invoke } from "@tauri-apps/api/core";

export class TauriWindowManager implements IWindowManager {
  createTimerWindow(): TE.TaskEither<string, void> {
    return TE.tryCatch(
      async () => {
        await invoke("show_timer_window");
      },
      (error) => `Failed to show timer: ${String(error)}`
    );
  }

  destroyTimerWindow(): TE.TaskEither<string, void> {
    return TE.tryCatch(
      async () => {
        await invoke("hide_timer_window");
      },
      (error) => `Failed to hide timer: ${String(error)}`
    );
  }

  // Similar for stain and capture...
}
```

### React Components

**Listen for show/hide events in overlay window components:**

```typescript
// src/windows/timer/Timer.tsx
import { listen } from "@tauri-apps/api/event";
import { useState, useEffect } from "react";

export const Timer = observer(function Timer() {
  const [isVisible, setIsVisible] = useState(false);
  const elapsed = appState$.currentSession.elapsed.get();

  useEffect(() => {
    const setupListeners = async () => {
      const unlistenShow = await listen("show-timer", () => {
        setIsVisible(true);
      });

      const unlistenHide = await listen("hide-timer", () => {
        setIsVisible(false);
      });

      return () => {
        unlistenShow();
        unlistenHide();
      };
    };

    setupListeners();
  }, []);

  return (
    <div className={`timer-widget ${isVisible ? "fade-in" : "fade-out"}`}>
      {formatDuration(elapsed)}
    </div>
  );
});
```

---

## Remove Old Code

### Files to Delete
- `src/infrastructure/adapters/TauriWindowManager.ts` (replace with new implementation)

### Remove from tauri.conf.json
- Timer, stain, capture window definitions (created in Rust now)

---

## Testing Plan

1. **Single monitor:** Timer appears top-center
2. **Multi-monitor:** Move cursor to second monitor, start session → timer follows
3. **Fullscreen app:** Open fullscreen video, verify timer/stain visible
4. **Z-order:** Start drift → stain appears, timer stays visible above it
5. **Capture:** Open capture modal during drift → appears above stain and timer
6. **Animations:** Smooth fade in/out transitions (300ms)

---

## Migration Notes

### Breaking Changes
- Window creation moved from tauri.conf.json to Rust
- TauriWindowManager API simplified (only invoke commands)

### Backward Compatibility
- Main panel behavior unchanged
- SessionService interface unchanged (still calls windowManager methods)

---

## Future Enhancements

1. **User-configurable overlay position** (top vs bottom)
2. **Retina display scaling** (currently assumes 1x, may need adjustment)
3. **Windows Z-order enforcement** (Win32 API like Handy uses)
4. **Panel animations** (slide in vs fade)

---

## References

- Handy app: https://github.com/cjpais/Handy (recording overlay implementation)
- tauri-nspanel: https://github.com/ahkohd/tauri-nspanel
- enigo: https://docs.rs/enigo/latest/enigo/
