#!/usr/bin/env node

/**
 * Syncs the version from apps/desktop/package.json into tauri.conf.json.
 * Called automatically by changesets during `pnpm version-packages`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const desktopPkgPath = resolve(root, "apps/desktop/package.json");
const tauriConfPath = resolve(root, "apps/desktop/src-tauri/tauri.conf.json");

const desktopPkg = JSON.parse(readFileSync(desktopPkgPath, "utf-8"));
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));

if (tauriConf.version !== desktopPkg.version) {
  tauriConf.version = desktopPkg.version;
  writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
  console.log(`Synced tauri.conf.json version to ${desktopPkg.version}`);
} else {
  console.log(`tauri.conf.json already at ${desktopPkg.version}`);
}
