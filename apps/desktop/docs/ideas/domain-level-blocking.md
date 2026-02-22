# Domain-Level Blocking

**Status:** Future enhancement (post-MVP)
**Current:** App-level blocking only (blocks entire applications)

## Problem

Users want to block specific websites (e.g., `twitter.com`) within browsers, not the entire browser application.

## Approaches

### 1. Network Extension (Content Filter) ⭐ Recommended

**Best for production.** macOS system extension that intercepts network traffic.

- **Pros:** System-level, works across all apps/browsers, official Apple API, can't be bypassed
- **Cons:** Complex (~1-2 weeks), requires entitlements, separate bundle, user approval in System Settings
- **Implementation:** NetworkExtension framework with NEFilterProvider

### 2. DNS-Level Blocking (Hosts File)

**MVP approach.** Modify `/etc/hosts` to redirect blocked domains to `127.0.0.1`.

- **Pros:** Simple (20 lines), works immediately, no system extension
- **Cons:** Requires sudo, doesn't work with DoH, easy to bypass, no path-level filtering
- **Implementation:** Tauri command to write to `/etc/hosts` with sudo prompt

### 3. Browser Extensions

**Hybrid approach.** Separate extensions for Chrome/Brave/Firefox/Safari.

- **Pros:** Direct URL access, can show in-page overlays, easier than Network Extension
- **Cons:** One per browser, users can disable, doesn't work for non-browser apps
- **Implementation:** Native Messaging with Tauri app

## Decision

- **MVP:** Keep app-level blocking (good enough for initial use case)
- **v1.0:** Implement Network Extension Content Filter for proper domain blocking
- **Alternative:** DNS-level as quick middle ground if needed before v1.0

## Notes

- Window titles don't help with domain detection (only show page titles, not URLs)
- Current app name detection works perfectly for app-level blocking
- Domain blocking requires fundamentally different technical approach
