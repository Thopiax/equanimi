# Monotask DDD Architecture Rebuild - Implementation Plan

## Decision: Rebuild from Scratch with Architecture Foundation First

**Approach:** Clean slate implementation following Domain-Driven Design and hexagonal architecture principles. Focus on getting the layers and patterns right before adding all features.

**Current State:**
- Working prototype in monolithic 206-line `App.tsx`
- Rust backend complete (66 lines - window tracking + permissions)
- Uses localStorage, no modular architecture
- Basic drift detection functional

**Target Architecture:**

```
UI Layer (React + Legend State)
    ↓ depends on
Application Layer (Use Cases/Services)
    ↓ depends on
Domain Layer (Pure Business Logic - ZERO dependencies)
    ↑ implemented by
Infrastructure Layer (Adapters for DB, Notifications, Config)
```

---

## Implementation Phases

### Phase 1: Foundation Setup (30 min)

**Install Dependencies:**
```bash
pnpm add @legendapp/state @tauri-apps/plugin-store
```

**Note:** Legend State is used for **UI reactivity only** (not persistence). Tauri Store handles persistence via repository implementations.

**Configure TypeScript path aliases** in `tsconfig.json` and `vite.config.ts`:
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@ui/*` → `src/ui/*`
- `@types/*` → `src/types/*`

**Create directory structure:**
```
src/
├── domain/                    # Pure TypeScript - zero dependencies
│   ├── aggregates/           # FocusSession
│   ├── entities/             # DriftEvent, Capture
│   ├── valueObjects/         # AppName, Duration, AlertPolicy
│   └── services/             # DriftDetectionService
├── application/               # Use cases
│   ├── services/             # SessionService, CaptureService, etc.
│   └── ServiceContainer.ts   # Dependency injection
├── infrastructure/            # External adapters
│   ├── ports/                # Interface definitions
│   ├── persistence/
│   │   ├── tauri-store/      # Tauri Store repositories (~/.monotask/store.bin)
│   │   └── filesystem/       # Config in ~/.monotask/config.json
│   └── notifications/        # Tauri notification wrapper
├── ui/                       # React components
│   ├── components/           # SetNorth, Navigation, Waypoint, DriftNotice
│   ├── hooks/                # useWindowTracking, useGlobalShortcuts, useServices
│   ├── state/                # appState.ts (Legend State observable - UI only)
│   └── App.tsx
├── types/                    # Shared types
│   ├── AppConfig.ts
│   └── TauriEvents.ts
├── bootstrap.ts              # App initialization
└── main.tsx                  # Entry point
```

**Add required plugins to Rust `src-tauri/src/lib.rs`:**

```rust
// Add these plugins if not already present:
.plugin(tauri_plugin_store::Builder::new().build())  // Tauri Store
.plugin(tauri_plugin_global_shortcut::Builder::new().build())  // Global shortcuts
```

**Also update `src-tauri/Cargo.toml`:**
```toml
[dependencies]
tauri-plugin-store = "2"
```

---

### Phase 2: Domain Layer (2 hours)

Build pure business logic with **zero infrastructure dependencies**.

**Value Objects:**
- `AppName` - Wraps app name string, has `.matches(pattern)` logic
- `Duration` - Wraps milliseconds, has `.format()` method
- `AlertPolicy` - Notification configuration

**Entities:**
- `Capture` - Waypoint thought with id, content, timestamp, sessionId
- `DriftEvent` - Drift occurrence with id, sessionId, appName, detectedAt

**Aggregate Root:**
- `FocusSession` - Core business logic
  - Properties: id, taskName, blocklist, startedAt, endedAt, status, alertPolicy
  - Methods: `isDriftedApp(appName)`, `complete()`, getters
  - Enforces invariants (e.g., task name can't be empty)

**Domain Service:**
- `DriftDetectionService` - Pure function `checkForDrift(currentApp, session)`

**Verification:** All domain code compiles with `npx tsc --noEmit`, zero dependencies.

---

### Phase 3: Infrastructure Ports (30 min)

Define contracts for all external dependencies as **interfaces**.

**Repository Ports:**
- `ISessionRepository` - save, findById, findActive, findAll
- `ICaptureRepository` - save, findAll, findBySessionId
- `IDriftEventRepository` - save, findBySessionId

**Service Ports:**
- `INotificationService` - send, checkPermission, requestPermission
- `IConfigRepository` - load, save

**Shared Types:**
- `AppConfig` - Configuration structure for ~/.monotask/config.json
- `WindowChangeEvent` - Rust event payload type

---

### Phase 4: Infrastructure Adapters (2 hours)

Implement all adapters for external systems.

**Tauri Store Setup:**
- Initialize Tauri Store in Rust (add plugin to `lib.rs`)
- Data stored in `~/.monotask/store.bin` (transparent file-based storage)
- Three collections: "sessions", "captures", "driftEvents"

**Repository Implementations:**
- `TauriStoreSessionRepository` - Uses `@tauri-apps/plugin-store` API
  - Serializes FocusSession to JSON, stores with "sessions:{id}" key
  - Maintains "activeSessionId" key for quick active session lookup
- `TauriStoreCaptureRepository` - Stores captures as "captures:{id}" keys
- `TauriStoreDriftEventRepository` - Stores drift events as "driftEvents:{id}" keys

**Example Repository Pattern:**
```typescript
import { Store } from '@tauri-apps/plugin-store';

class TauriStoreSessionRepository implements ISessionRepository {
  private store: Store;

  constructor() {
    this.store = new Store('.monotask/store.bin');
  }

  async save(session: FocusSession): Promise<void> {
    await this.store.set(`sessions:${session.getId()}`, session.toJSON());
    if (session.isActive()) {
      await this.store.set('activeSessionId', session.getId());
    }
    await this.store.save(); // Persist to disk
  }
  // ... more methods
}
```

**Notification Adapter:**
- `TauriNotificationAdapter` - Wraps `@tauri-apps/plugin-notification`
  - Format: "🧭 Off Course\nYou're in {app}\nYour north: {task}"

**Config Repository:**
- `FileSystemConfigRepository` - Manages ~/.monotask/config.json using Tauri FS API
  - Creates directory if missing
  - Returns DEFAULT_CONFIG if file doesn't exist

**Verification:** Can save/load from Tauri Store (~/.monotask/store.bin exists), send notifications, read/write config file.

---

### Phase 5: Application Services (1.5 hours)

Implement use cases that orchestrate domain + infrastructure.

**Services:**
- `SessionService` - startSession, endSession, getActiveSession, handleWindowChange
- `CaptureService` - createCapture, getAllCaptures, getCapturesBySession
- `NotificationFacade` - sendDriftAlert, ensurePermissions
- `ConfigService` - getConfig, updateConfig, getDefaultBlocklist

**Dependency Injection:**
- `ServiceContainer` - Wires all services with their dependencies
  - Constructor takes all repository and service implementations
  - Provides single access point for all application services

---

### Phase 6: State Management & Hooks (1 hour)

Create reactive UI state and access layer.

**App State (Legend State observable - UI reactivity only, NOT persisted):**
```typescript
appState$ = {
  currentSession: FocusSession | null,
  currentApp: string,
  activeDrift: DriftEvent | null,
  ui: { showCaptureModal: boolean }
}
```

**Note:** This state is ephemeral (lost on refresh). Persistence happens via Tauri Store in repository layer. On app startup, repositories hydrate this state from disk.

**Hooks:**
- `useServices` - React context hook for accessing ServiceContainer
- `useWindowTracking` - Listens to Rust "window_changed" events, updates appState$, calls SessionService.handleWindowChange
- `useGlobalShortcuts` - Registers Cmd+Shift+C to open capture modal

---

### Phase 7: UI Components (2 hours)

Build React components using Legend State `observer()`.

**Components:**
- `SetNorth` - Session setup form (task name, blocklist input)
- `Navigation` - Active session view (shows current app, end session button)
- `Waypoint` - Capture modal (opens with Cmd+Shift+C)
- `DriftNotice` - Drift overlay (optional for MVP, shows when drift detected)
- `App` - Root component, initializes hooks, conditional rendering

All components wrapped with `observer()` from `@legendapp/state/react`.

---

### Phase 8: Bootstrap & Integration (2 hours)

Wire everything together and initialize the app.

**Bootstrap Function:**
1. Initialize Tauri Store (create Store instance)
2. Initialize all adapters (repositories, notification service, config)
3. Create ServiceContainer with dependency injection
4. Start Rust window tracking via `invoke("start_tracking")`
5. Request notification permissions
6. Hydrate active session from Tauri Store into appState$
7. Return ServiceContainer

**Main Entry Point:**
- Wrap App with `<ServiceProvider>` to provide ServiceContainer via context
- Call bootstrap() before rendering

**Verification:**
- Full flow: Start session → Switch to blocked app → Get notification
- Cmd+Shift+C opens capture modal
- Session persists after app restart
- **~/.monotask/store.bin exists** (Tauri Store data)
- ~/.monotask/config.json exists

---

### Phase 9: Data Migration (30 min - Optional)

Migrate existing localStorage captures to Tauri Store.

**Migration script:**
- Read `localStorage.getItem("captures")`
- Parse JSON array of strings
- Create Capture entities for each
- Save via CaptureRepository (writes to Tauri Store)
- Remove localStorage key

**Integrate into bootstrap:** Call migration before returning ServiceContainer.

---

## Critical Files (Implementation Order)

1. **Domain layer value objects, entities** - Foundation with zero dependencies
2. **FocusSession aggregate root** - Core business logic
3. **Infrastructure ports** - Interface definitions
4. **Tauri Store repositories** - Persistence implementation
5. **Application services** - Use cases
6. **ServiceContainer** - Dependency injection
7. **appState$ and hooks** - Reactive UI layer (Legend State)
8. **React components** - UI
9. **bootstrap.ts** - Application initialization (includes Tauri Store setup)
10. **main.tsx** - Entry point

---

## Key Integration Points

**Rust → TypeScript:**
```
Rust x-win polling
  → emit "window_changed" event
  → useWindowTracking hook
  → SessionService.handleWindowChange()
  → NotificationFacade.sendDriftAlert()
  → Rust notification plugin
```

**TypeScript → Tauri Store:**
```
User action
  → Service method
  → Repository.save()
  → Tauri Store.set(key, data)
  → Store.save() (persist to ~/.monotask/store.bin)
  → Update appState$ (for UI reactivity)
```

**TypeScript → FileSystem:**
```
App startup
  → ConfigService.getConfig()
  → FileSystemConfigRepository.load()
  → Tauri FS API
  → ~/.monotask/config.json
```

---

## Files to Delete/Move

**Delete:**
- Current `src/App.tsx` (will be replaced with new architecture)

**Move:**
- `src/App.css` → `src/ui/App.css`

---

## Success Criteria

✅ Domain layer compiles with zero dependencies
✅ **Tauri Store file exists at ~/.monotask/store.bin**
✅ Sessions persist across app restarts (loaded from Tauri Store)
✅ Notifications appear when switching to blocked apps
✅ Cmd+Shift+C opens capture modal
✅ Config file created in ~/.monotask/config.json
✅ No TypeScript compilation errors
✅ Functional programming patterns throughout
✅ Clean separation of concerns across all layers
✅ Data is transparent (JSON in store.bin, human-readable config.json)

---

## Post-Implementation Extensions

With this architecture in place, future features become straightforward:

1. Menu bar icon (Tauri system tray)
2. Progressive friction (overlay after 30s of drift)
3. Session history view
4. Capture search
5. Data export (JSON)
6. Multiple session templates

Each feature maps cleanly to a layer without cross-cutting changes.

---

**Estimated Total Time:** 12 hours of focused work

**Philosophy:** Get the architecture right first. Features are easy once the foundation is solid. This is infrastructure that fades, not experience that extracts.

🧭 Build the compass. Let users find their own north.
