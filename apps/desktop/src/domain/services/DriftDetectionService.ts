import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { FocusSession, isActive, isDriftedApp, getId } from "../aggregates/FocusSession";
import { DriftEvent, createDriftEvent } from "../entities/DriftEvent";

/**
 * Domain Service: DriftDetectionService
 * Pure function for drift detection logic using fp-ts
 */
export const checkForDrift = (
  currentApp: string,
  session: O.Option<FocusSession>
): O.Option<DriftEvent> =>
  pipe(
    session,
    O.filter(isActive),
    O.chain((s) =>
      isDriftedApp(s)(currentApp)
        ? O.some(createDriftEvent(getId(s), currentApp))
        : O.none
    )
  );
