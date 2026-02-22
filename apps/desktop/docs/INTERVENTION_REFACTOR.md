# Intervention Protocol Architecture Refactor

**Status:** IN PROGRESS
**Started:** 2025-11-29
**Target:** v0.2.0

---

## Overview

Refactoring the intervention system from hardcoded, tightly-coupled components into a composable, DDD-based architecture.

### The Problem
- `IWindowManager` has hardcoded methods for each window type
- `VisualizationService` knows about specific intervention types
- `AlertPolicy` is poorly named (should be "intervention protocols")
- No way to enable/disable interventions individually
- Can't compose interventions differently

### The Solution
- **Domain model** where interventions are first-class concepts
- **Generic infrastructure** (IOverlayManager replaces window-specific methods)
- **Smart orchestrator** (decides what to trigger based on protocol)
- **Config-driven** (enable/disable interventions via AppConfig)
- **BCT/PDP metadata** (behavioral science rigor)

---

## Implementation Progress

### ✅ Phase 1: Domain Layer (COMPLETED)

**Created 6 value objects:**
1. `src/domain/valueObjects/InterventionType.ts` - notification | timer | stain | dialog
2. `src/domain/valueObjects/TriggerCondition.ts` - immediate | delayed | threshold
3. `src/domain/valueObjects/InterventionSettings.ts` - type-specific config
4. `src/domain/valueObjects/InterventionConfig.ts` - complete intervention config
5. `src/domain/valueObjects/InterventionProtocol.ts` - replaces AlertPolicy
6. `src/domain/valueObjects/InterventionMetadata.ts` - BCT/PDP tags (internal only)

**Updated:**
- `src/domain/aggregates/FocusSession.ts` - Now uses `interventionProtocol` instead of `alertPolicy`

### ✅ Phase 2: Infrastructure Ports (COMPLETED)

**Created:**
1. `src/infrastructure/ports/IOverlayManager.ts` - Generic overlay operations
2. `src/infrastructure/ports/IDialogService.ts` - Dialog operations

### ✅ Phase 3: Rust/Tauri Integration (COMPLETED)

**Modified:**
1. `src-tauri/Cargo.toml` - Added `tauri-plugin-dialog = "2"`
2. `src-tauri/src/lib.rs` - Initialized dialog plugin

### ✅ Phase 4: Infrastructure Adapters (COMPLETED)

**Created:**
1. `src/infrastructure/adapters/TauriOverlayManager.ts` (228 lines)
   - Dynamically creates windows (like preferences)
   - Auto-positions timer near notch on MacBooks
   - Keeps stain implementation (disabled by default)

2. `src/infrastructure/adapters/TauriDialogAdapter.ts`
   - Implements commitment dialog (BCT 1.8: Behavioral contract)

### ✅ Phase 5a: Application Layer - Orchestrator (COMPLETED)

**Created:**
1. `src/application/services/InterventionOrchestrator.ts` (234 lines)
   - The "brain" that decides which interventions to trigger
   - Evaluates trigger conditions (immediate, delayed, threshold)
   - Manages intervention state (event counts, last triggered time)
   - Handles stain animation progression
   - Shows commitment dialog at session start if enabled

---

## 🚧 Remaining Work

### Phase 5b: Modify SessionService

**File:** `src/application/services/SessionService.ts`

**Changes needed:**
- Remove import of `VisualizationService`
- Add import of `InterventionOrchestrator`
- Replace all `visualizationService` calls with `interventionOrchestrator`
- Update `startSession()` to use `onSessionStart()`
- Update `endActiveSession()` to use `onSessionEnd()`
- Update `handleWindowChange()` to use `onDriftDetected()` and `onDriftCleared()`

### Phase 5c: Wire ServiceContainer

**File:** `src/application/ServiceContainer.ts`

**Changes needed:**
- Add `IOverlayManager` and `IDialogService` imports
- Add `TauriOverlayManager` and `TauriDialogAdapter` imports
- Add `InterventionOrchestrator` import
- Create adapter instances in constructor
- Create orchestrator instance
- Wire orchestrator into SessionService constructor
- Remove old `visualizationService` wiring

### Phase 6: Configuration

**File:** `src/types/AppConfig.ts`

**Add:** `InterventionProtocolConfig` interface
```typescript
readonly interventionProtocol?: {
  readonly notification: {
    readonly enabled: boolean;
    readonly delayMs: number;
  };
  readonly timer: {
    readonly enabled: boolean;
  };
  readonly stain: {
    readonly enabled: boolean;
    readonly delayMs: number;
    readonly mode: "fullscreen" | "windowed";
  };
  readonly dialog: {
    readonly enabled: boolean;
    readonly showCommitmentOnStart: boolean;
  };
}
```

**File:** `src/infrastructure/persistence/filesystem/FileSystemConfigRepository.ts`

**Add:** Migration logic in `migrateConfig()` to convert old `AlertPolicy` fields to new `interventionProtocol` structure

### Phase 7: Cleanup

**Delete these files:**
1. `src/domain/valueObjects/AlertPolicy.ts`
2. `src/application/services/VisualizationService.ts`
3. `src/infrastructure/ports/IWindowManager.ts`
4. `src/infrastructure/adapters/TauriWindowManager.ts`

---

## Key Design Decisions

### 1. Keep Stain (Disabled by Default)
**Rationale:** User may want to experiment with friction-based interventions later. Keeping code allows quick re-enabling without rebuild.

### 2. BCT/PDP Metadata Internal Only
**Rationale:** Keeps UI simple for v0.1. Metadata serves as development documentation and enables future features (e.g., "Show me why this works" tooltip).

### 3. Commitment Dialog at Session Start
**Rationale:** Creates psychological buy-in (BCT 1.8: Behavioral contract). Stronger intervention than action planning after drift.

### 4. Timer Auto-Positioning Near Notch
**Rationale:** Works across screen sizes, non-intrusive placement, consistent with macOS design language.

### 5. Generic Trigger Conditions
**Rationale:** Enables composability - same intervention can trigger differently based on user preference or context.

---

## Intervention Types & BCT Mapping

| Type | BCT Code | BCT Name | PDP | Description |
|------|----------|----------|-----|-------------|
| `notification` | 7.1 | Prompts/cues | Suggestion, Reminders | System notification on drift |
| `timer` | 2.3, 2.2 | Self-monitoring, Feedback | Self-monitoring | Progress widget showing state |
| `stain` | 14.2 | Punishment | Reduction | Visual overlay (disabled) |
| `dialog` | 1.8, 1.4 | Behavioral contract, Action planning | Suggestion | Commitment dialog |

---

## Testing Checklist

### Manual Testing Priority

- [ ] **Session Start with Commitment Dialog**
  - Start session → Should show commitment dialog
  - Press "Commit" → Session starts, timer appears
  - Press "Cancel" → Session doesn't start

- [ ] **Timer Widget Auto-Positioning**
  - Test on different screen sizes
  - Verify appears near center-top (near notch area)

- [ ] **Drift Detection**
  - Drift to blocked app → Notification fires (if enabled)
  - Timer updates to "drifted" state
  - Return to focus → Timer returns to "focused" state

- [ ] **Config Migration**
  - Start with old config (enableNotifications, etc.)
  - Launch app → Should migrate to new format
  - Verify interventions still work

- [ ] **Stain (If Manually Enabled)**
  - Enable stain in config
  - Drift → Stain should appear after 30s delay
  - Stain grows to 100% over 120s
  - Return to focus → Stain fades out

---

## Files Changed Summary

### Created (11 files)
- `src/domain/valueObjects/InterventionType.ts`
- `src/domain/valueObjects/TriggerCondition.ts`
- `src/domain/valueObjects/InterventionSettings.ts`
- `src/domain/valueObjects/InterventionConfig.ts`
- `src/domain/valueObjects/InterventionProtocol.ts`
- `src/domain/valueObjects/InterventionMetadata.ts`
- `src/infrastructure/ports/IOverlayManager.ts`
- `src/infrastructure/ports/IDialogService.ts`
- `src/infrastructure/adapters/TauriOverlayManager.ts`
- `src/infrastructure/adapters/TauriDialogAdapter.ts`
- `src/application/services/InterventionOrchestrator.ts`

### Modified (5 files)
- `src/domain/aggregates/FocusSession.ts` - Use InterventionProtocol
- `src-tauri/Cargo.toml` - Add dialog plugin
- `src-tauri/src/lib.rs` - Initialize dialog plugin
- `src/application/services/SessionService.ts` - TODO: Use orchestrator
- `src/application/ServiceContainer.ts` - TODO: Wire new services
- `src/types/AppConfig.ts` - TODO: Add interventionProtocol
- `src/infrastructure/persistence/filesystem/FileSystemConfigRepository.ts` - TODO: Migration

### To Delete (4 files)
- `src/domain/valueObjects/AlertPolicy.ts`
- `src/application/services/VisualizationService.ts`
- `src/infrastructure/ports/IWindowManager.ts`
- `src/infrastructure/adapters/TauriWindowManager.ts`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ InterventionProtocol (Value Object)                  │   │
│  │  - interventions: InterventionConfig[]               │   │
│  │                                                       │   │
│  │ InterventionConfig (Value Object)                    │   │
│  │  - type: InterventionType                            │   │
│  │  - enabled: boolean                                  │   │
│  │  - trigger: TriggerCondition                         │   │
│  │  - settings: InterventionSettings                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ InterventionOrchestrator (Service)                   │   │
│  │  - onDriftDetected()    → Evaluate & trigger         │   │
│  │  - onDriftCleared()     → Update overlays            │   │
│  │  - onSessionStart()     → Show commitment + timer    │   │
│  │  - onSessionEnd()       → Hide all                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                         │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ IOverlayManager    │  │ IDialogService     │            │
│  │ (Port)             │  │ (Port)             │            │
│  └────────────────────┘  └────────────────────┘            │
│           ↓                       ↓                          │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │TauriOverlayManager │  │TauriDialogAdapter  │            │
│  │ (Adapter)          │  │ (Adapter)          │            │
│  │ - showTimer()      │  │ - showCommitment() │            │
│  │ - showStain()      │  │ - confirm()        │            │
│  │ - showCapture()    │  │ - message()        │            │
│  └────────────────────┘  └────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Session

When resuming work:
1. Start with SessionService modification
2. Then wire ServiceContainer
3. Update AppConfig + migration
4. Delete old files
5. Run type check: `npx tsc --noEmit`
6. Test manually with checklist above

**Estimated remaining time:** 1-2 hours
