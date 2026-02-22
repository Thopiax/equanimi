import * as TE from "fp-ts/TaskEither";
import { IConfigRepository } from "../../infrastructure/ports/IConfigRepository";
import { AppConfig, DEFAULT_CONFIG } from "../../types/AppConfig";
import { pipe } from "fp-ts/lib/function";

/**
 * Application Service: Configuration Management
 *
 * Orchestrates configuration loading, saving, and default values.
 */
export class ConfigService {
  constructor(private readonly configRepo: IConfigRepository) {}

  /**
   * Get current application configuration
   * Returns default config if file doesn't exist
   */
  getConfig(): TE.TaskEither<string, AppConfig> {
    return this.configRepo.load();
  }

  /**
   * Update application configuration
   */
  updateConfig(config: AppConfig): TE.TaskEither<string, void> {
    return this.configRepo.save(config);
  }

  /**
   * Get default blocklist patterns
   */
  getDefaultBlocklist(): readonly string[] {
    return DEFAULT_CONFIG.defaultBlocklist;
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): TE.TaskEither<string, void> {
    return this.configRepo.save(DEFAULT_CONFIG);
  }

  /**
   * Update global keyboard shortcuts
   */
  updateShortcuts(shortcuts: {
    captureModal: string | null;
    startSession: string | null;
  }): TE.TaskEither<string, void> {
    return pipe(
      this.configRepo.load(),
      TE.chain((config) =>
        this.configRepo.save({
          ...config,
          globalShortcuts: shortcuts,
        })
      )
    );
  }
}
