import { storage } from "wxt/storage";

/**
 * Per-shield storage factory.
 *
 * Convention: `local:shield:<id>:enabled`
 * Extensible to future per-shield settings via additional keys.
 */
export function shieldEnabled(shieldId: string, fallback: boolean) {
  return storage.defineItem<boolean>(`local:shield:${shieldId}:enabled`, {
    fallback,
  });
}

/**
 * Per-signal storage factory.
 *
 * Convention: `local:signal:<id>:enabled`
 */
export function signalEnabled(signalId: string, fallback: boolean) {
  return storage.defineItem<boolean>(`local:signal:${signalId}:enabled`, {
    fallback,
  });
}

/**
 * Per-signal setting storage factory.
 *
 * Convention: `local:signal:<id>:<key>`
 * Use for configurable settings like position, thresholds, etc.
 */
export function signalSetting<T>(
  signalId: string,
  key: string,
  fallback: T
) {
  return storage.defineItem<T>(`local:signal:${signalId}:${key}`, {
    fallback,
  });
}

/**
 * Per-shield setting storage factory.
 *
 * Convention: `local:shield:<id>:<key>`
 * Use for configurable settings like cooldown duration, thresholds, etc.
 */
export function shieldSetting<T>(
  shieldId: string,
  key: string,
  fallback: T
) {
  return storage.defineItem<T>(`local:shield:${shieldId}:${key}`, {
    fallback,
  });
}

/**
 * Per-domain budget definition storage.
 *
 * Convention: `local:budget:<domain>:definition`
 */
export function budgetDefinition<T>(domain: string, fallback: T) {
  return storage.defineItem<T>(`local:budget:${domain}:definition`, {
    fallback,
  });
}

/**
 * Per-domain budget state storage.
 *
 * Convention: `local:budget:<domain>:<key>`
 * Use for tracking consumption: daily-seconds, daily-sessions, etc.
 */
export function budgetState<T>(domain: string, key: string, fallback: T) {
  return storage.defineItem<T>(`local:budget:${domain}:${key}`, {
    fallback,
  });
}

/**
 * Per-domain cooldown storage.
 *
 * Convention: `local:cooldown:<domain>:until`
 * Stores a Unix-ms timestamp for when the cooldown expires.
 * 0 = no active cooldown. Shared across all content scripts for a domain.
 */
export function domainCooldown(domain: string) {
  return storage.defineItem<number>(`local:cooldown:${domain}:until`, {
    fallback: 0,
  });
}
