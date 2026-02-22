/**
 * Budget domain types.
 *
 * Re-exported from the shared domain package (@equanimi/domain).
 * The shared types are a superset — browser uses a subset of session
 * units and dimensions, but the type system is the same.
 */
export type {
  SessionUnit,
  BudgetDimension,
  BudgetDefinition,
  DimensionConsumption,
  BudgetConsumption,
} from "@equanimi/domain";

export { createBudgetDefinition, computeOverallProgress } from "@equanimi/domain";
