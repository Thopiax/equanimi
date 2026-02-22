# Configurable Global Shortcuts Design

**Date:** 2025-11-28
**Status:** Approved
**Architecture:** Config + Hook Pattern

## Problem

Global shortcuts are hardcoded in `useGlobalShortcuts.ts`. Users cannot customize them. As we add features, hardcoding each shortcut becomes unmaintainable.

## Solution

Store shortcuts in `AppConfig`. Load them at runtime. Register shortcuts dynamically.

## Requirements

1. **Extensibility** - New features add shortcuts without changing the hook
2. **User control** - Users can customize or disable any shortcut
3. **Error handling** - Show notifications when registration fails
4. **Backwards compatibility** - Old configs work without migration

## Design

### Config Schema

Extend `AppConfig` with a `globalShortcuts` field:

```typescript
// src/types/AppConfig.ts
export interface AppConfig {
  readonly defaultBlocklist: readonly string[];
  readonly enableNotifications: boolean;
  readonly progressiveFrictionDelay?: number;
  readonly globalShortcuts?: Readonly<Record<string, string | null>>;
}

export const DEFAULT_CONFIG: AppConfig = {
  defaultBlocklist: [...],
  enableNotifications: true,
  progressiveFrictionDelay: undefined,
  globalShortcuts: {
    captureModal: "CommandOrControl+Shift+C",
  },
};
```

**Schema decisions:**
- **Optional field** - missing field uses `DEFAULT_CONFIG` values
- **Action-keyed object** - `{ "captureModal": "Cmd+Shift+C" }` maps action to shortcut
- **Nullable values** - `{ "captureModal": null }` disables the shortcut
- **Readonly** - immutable, following existing patterns

### Action Handlers

Map action names to handler functions:

```typescript
// src/ui/hooks/useGlobalShortcuts.ts

const ACTION_HANDLERS: Record<string, () => void> = {
  captureModal: () => {
    appState$.ui.showCaptureModal.set(
      !appState$.ui.showCaptureModal.get()
    );
  },
  // Future actions:
  // startSession: () => { ... },
  // endSession: () => { ... },
};

function handleAction(action: string): void {
  const handler = ACTION_HANDLERS[action];
  if (handler) {
    handler();
  } else {
    console.warn(`Unknown action: ${action}`);
  }
}
```

### Hook Implementation

Load config, register shortcuts dynamically, track registrations for cleanup:

```typescript
// src/ui/hooks/useGlobalShortcuts.ts

export function useGlobalShortcuts(): void {
  const services = useServices();

  useEffect(() => {
    const registeredShortcuts: string[] = [];

    const setupShortcuts = async () => {
      try {
        const configResult = await services.configService.getConfig()();
        if (configResult._tag === "Left") {
          console.error("Failed to load config:", configResult.left);
          return;
        }

        const shortcuts = configResult.right.globalShortcuts ?? {};

        for (const [action, shortcut] of Object.entries(shortcuts)) {
          if (shortcut) {
            try {
              await register(shortcut, () => handleAction(action));
              registeredShortcuts.push(shortcut);
            } catch (error) {
              await services.notificationService.send(
                "Shortcut Failed",
                `Could not register ${shortcut} for ${action}`
              )();
            }
          }
        }
      } catch (error) {
        console.error("Shortcut setup failed:", error);
      }
    };

    setupShortcuts();

    return () => {
      for (const shortcut of registeredShortcuts) {
        unregister(shortcut).catch(console.error);
      }
    };
  }, [services]);
}
```

**Implementation details:**
- Loads config via `configService.getConfig()`
- Iterates shortcuts object dynamically
- Skips null shortcuts (disabled by user)
- Shows notifications when registration fails
- Tracks successful registrations for cleanup
- Cleanup unregisters only what succeeded

### Error Handling

Registration failures trigger notifications. The app continues running. Failed shortcuts simply don't work.

**User sees:**
- Notification: "Shortcut Failed - Could not register Cmd+Shift+C for captureModal"
- Other shortcuts still work
- App remains usable

**Developer sees:**
- Console error with details
- Which shortcut failed
- Which action it was for

## Files Modified

1. **`src/types/AppConfig.ts`** - Add `globalShortcuts` field and default
2. **`src/ui/hooks/useGlobalShortcuts.ts`** - Add handlers registry, refactor to load config

## Backwards Compatibility

No migration needed. The `globalShortcuts` field is optional. Missing field uses `DEFAULT_CONFIG`. Old configs continue working.

## Testing

**Manual testing:**
1. Edit `~/.monotask/config.json`, add `"globalShortcuts": { "captureModal": "Cmd+Shift+X" }`
2. Restart app, verify Cmd+Shift+X opens capture modal
3. Set `"captureModal": null`, verify shortcut disabled
4. Set invalid shortcut, verify notification appears
5. Remove field entirely, verify default (Cmd+Shift+C) works

## Future Extension

Adding a new shortcut requires three changes:
1. Add handler to `ACTION_HANDLERS`
2. Add default to `DEFAULT_CONFIG.globalShortcuts`
3. Done

No changes to hook logic. No changes to cleanup. No changes to config service.

## Alternatives Considered

**Application Service** - Create `ShortcutService` in application layer. More testable, better DDD purity, but unnecessary abstraction for current needs.

**Action Registry** - Features register actions with metadata. Most extensible, but over-engineered. YAGNI.

We chose Config + Hook Pattern for simplicity and speed.
