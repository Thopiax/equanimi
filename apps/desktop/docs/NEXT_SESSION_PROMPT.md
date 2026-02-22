# Refactor Intervention System to Use Strategy Pattern

## Context

We're mid-way through refactoring Monotask's intervention system. See `docs/INTERVENTION_REFACTOR.md` for full context and progress.

**What's been completed:**
- ✅ Domain value objects (InterventionProtocol, TriggerCondition, etc.)
- ✅ Infrastructure ports (IOverlayManager, IDialogService)
- ✅ Infrastructure adapters (TauriOverlayManager, TauriDialogAdapter)
- ✅ InterventionOrchestrator (but needs refactoring - see below)
- ✅ Renamed "timer" to "compass" throughout

**What's NOT done:**
- 🚧 SessionService modification
- 🚧 ServiceContainer wiring
- 🚧 AppConfig updates
- 🚧 File cleanup

## The Problem

The `InterventionOrchestrator` has hardcoded switch statements that violate DDD principles:

```typescript
// Current (BAD):
switch (config.type) {
  case "notification":
    return this.notificationService.sendDriftNotification(...);
  case "compass":
    return this.overlayManager.updateCompass(...);
  case "stain":
    // hardcoded stain logic with setInterval
  case "dialog":
    // hardcoded dialog logic
}
```

**Issues:**
- ❌ Violates Open/Closed Principle (can't add intervention without modifying orchestrator)
- ❌ BCT metadata is decorative (not functional)
- ❌ Not composable or extensible
- ❌ All intervention logic lives in orchestrator (anemic domain model)
- ❌ Mixed concerns (orchestration + execution)

## The Refactoring Task

**Refactor to Strategy Pattern + Domain Services:**

### 1. Create Domain Intervention Services

Each intervention type should be its own **domain service** with:
- Execution logic
- BCT/PDP metadata
- State management (if needed)

**File structure:**
```
src/domain/interventions/
  Compass.ts           # Compass HUD intervention (BCT 2.3: Self-monitoring)
  Notification.ts      # Notification intervention (BCT 7.1: Prompts/cues)
  Stain.ts            # Stain overlay intervention (BCT 14.2: Punishment)
  CommitmentDialog.ts  # Commitment dialog intervention (BCT 1.8: Behavioral contract)
```

### 2. Define Intervention Interface

Create a common interface that all interventions implement:

```typescript
// src/domain/interventions/IIntervention.ts
import * as TE from "fp-ts/TaskEither";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { InterventionSpec } from "../valueObjects/InterventionMetadata";
import { FocusSession } from "../aggregates/FocusSession";
import { DriftEvent } from "../entities/DriftEvent";

export interface InterventionContext {
  readonly session: FocusSession;
  readonly driftEvent?: DriftEvent;
  readonly windowPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Domain Service: Intervention
 *
 * Represents a behavior change intervention with execution logic
 * and behavioral science metadata.
 */
export interface IIntervention {
  /**
   * Execute this intervention
   */
  execute(
    config: InterventionConfig,
    context: InterventionContext
  ): TE.TaskEither<string, void>;

  /**
   * Get BCT/PDP metadata for this intervention
   */
  getMetadata(): InterventionSpec;

  /**
   * Called when session starts (for persistent interventions like Compass)
   */
  onSessionStart?(context: InterventionContext): TE.TaskEither<string, void>;

  /**
   * Called when session ends
   */
  onSessionEnd?(): TE.TaskEither<string, void>;

  /**
   * Called when drift is cleared (for cleanup)
   */
  onDriftCleared?(context: InterventionContext): TE.TaskEither<string, void>;
}
```

### 3. Example Implementation

```typescript
// src/domain/interventions/Compass.ts
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IIntervention, InterventionContext } from "./IIntervention";
import { InterventionConfig } from "../valueObjects/InterventionConfig";
import { INTERVENTION_METADATA } from "../valueObjects/InterventionMetadata";
import { getProgress } from "../aggregates/FocusSession";
import { IOverlayManager } from "../../infrastructure/ports/IOverlayManager";

/**
 * Compass Intervention (Domain Service)
 *
 * Persistent navigation HUD showing alignment with intention.
 * Implements BCT 2.3 (Self-monitoring) and BCT 2.2 (Feedback).
 */
export class Compass implements IIntervention {
  constructor(private readonly overlayManager: IOverlayManager) {}

  execute(config: InterventionConfig, context: InterventionContext): TE.TaskEither<string, void> {
    // Update compass state on drift
    return this.overlayManager.updateCompass({
      progress: getProgress(context.session),
      state: "drifted",
    });
  }

  onSessionStart(context: InterventionContext): TE.TaskEither<string, void> {
    // Show compass when session starts
    return this.overlayManager.showCompass(0);
  }

  onSessionEnd(): TE.TaskEither<string, void> {
    // Hide compass when session ends
    return this.overlayManager.hideCompass();
  }

  onDriftCleared(context: InterventionContext): TE.TaskEither<string, void> {
    // Update to focused state
    return this.overlayManager.updateCompass({
      progress: getProgress(context.session),
      state: "focused",
    });
  }

  getMetadata() {
    return INTERVENTION_METADATA.compass;
  }
}
```

### 4. Refactor InterventionOrchestrator

```typescript
// src/application/services/InterventionOrchestrator.ts (REFACTORED)
export class InterventionOrchestrator {
  private interventions: Map<InterventionType, IIntervention>;
  private activeInterventions = new Map<string, InterventionState>();

  constructor(interventions: Map<InterventionType, IIntervention>) {
    this.interventions = interventions;
  }

  onDriftDetected(
    session: FocusSession,
    driftEvent: DriftEvent,
    windowPosition?: { x: number; y: number; width: number; height: number }
  ): TE.TaskEither<string, void> {
    const protocol = getInterventionProtocol(session);
    const enabled = getEnabledInterventions(protocol);

    const context: InterventionContext = { session, driftEvent, windowPosition };

    // Filter interventions that should trigger
    const toTrigger = enabled.filter((config) =>
      this.shouldTrigger(config, Date.now())
    );

    // Execute interventions via registry lookup
    return pipe(
      TE.sequenceArray(
        toTrigger.map((config) => {
          const intervention = this.interventions.get(config.type);
          if (!intervention) {
            return TE.left(`Unknown intervention type: ${config.type}`);
          }

          // Update state
          const state = this.getOrCreateState(config.type);
          state.lastTriggered = Date.now();
          state.eventCount += 1;

          return intervention.execute(config, context);
        })
      ),
      TE.map(() => void 0)
    );
  }

  onSessionStart(session: FocusSession): TE.TaskEither<string, void> {
    const protocol = getInterventionProtocol(session);
    const enabled = getEnabledInterventions(protocol);
    const context: InterventionContext = { session };

    // Call onSessionStart for all enabled interventions that support it
    return pipe(
      TE.sequenceArray(
        enabled
          .map((config) => this.interventions.get(config.type))
          .filter((i): i is IIntervention => i !== undefined)
          .filter((i) => i.onSessionStart !== undefined)
          .map((i) => i.onSessionStart!(context))
      ),
      TE.map(() => void 0)
    );
  }

  // Similar for onSessionEnd, onDriftCleared, etc.
}
```

### 5. Wire in ServiceContainer

```typescript
// src/application/ServiceContainer.ts
const interventions = new Map<InterventionType, IIntervention>([
  ["compass", new Compass(overlayManager)],
  ["notification", new Notification(notificationService)],
  ["stain", new Stain(overlayManager)],
  ["dialog", new CommitmentDialog(dialogService)],
]);

this.interventionOrchestrator = new InterventionOrchestrator(interventions);
```

## Requirements

1. **Create intervention domain services** in `src/domain/interventions/`:
   - `Compass.ts`
   - `Notification.ts`
   - `Stain.ts` (with interval-based growth animation)
   - `CommitmentDialog.ts`

2. **Create IIntervention interface** in `src/domain/interventions/IIntervention.ts`

3. **Refactor InterventionOrchestrator** to use strategy pattern (registry lookup instead of switch)

4. **Keep BCT metadata functional** - each intervention returns its own metadata via `getMetadata()`

5. **Maintain all existing behavior** - this is a refactoring, not a feature change

## Benefits of This Approach

✅ **Open/Closed Principle** - Add new intervention by creating class and registering it
✅ **Domain-driven** - Each intervention is a domain service with business logic
✅ **BCT metadata is functional** - Retrieved from intervention, not static lookup
✅ **Testable** - Each intervention tested in isolation
✅ **Composable** - Easy to add, remove, or modify interventions
✅ **Type-safe** - Registry enforces IIntervention contract

## Files to Modify

**Create:**
- `src/domain/interventions/IIntervention.ts`
- `src/domain/interventions/Compass.ts`
- `src/domain/interventions/Notification.ts`
- `src/domain/interventions/Stain.ts`
- `src/domain/interventions/CommitmentDialog.ts`

**Modify:**
- `src/application/services/InterventionOrchestrator.ts` - Use registry instead of switch
- `src/application/ServiceContainer.ts` - Create intervention instances and registry

**Reference:**
- Current implementation: `src/application/services/InterventionOrchestrator.ts` (has all the logic)
- BCT metadata: `src/domain/valueObjects/InterventionMetadata.ts`

## Success Criteria

After refactoring:
- [ ] No switch statements in InterventionOrchestrator
- [ ] Each intervention type is a separate class implementing IIntervention
- [ ] BCT metadata retrieved via `intervention.getMetadata()`
- [ ] All existing behavior preserved (compass shows on start, updates on drift, etc.)
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] Adding a new intervention type doesn't require modifying orchestrator

## Next Steps After This Refactoring

Once the strategy pattern is implemented:
1. Complete SessionService modification
2. Wire ServiceContainer
3. Update AppConfig with intervention protocol configuration
4. Add migration logic
5. Delete old files (AlertPolicy, VisualizationService, IWindowManager, TauriWindowManager)
6. Test the full implementation

---

**Start here:** Create the IIntervention interface and Compass domain service first, then refactor the orchestrator to use it. Work incrementally.
