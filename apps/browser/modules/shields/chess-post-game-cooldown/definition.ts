import type { ShieldDefinition } from "../types";

/**
 * Post-game cooldown for chess.com.
 *
 * Intercepts "New Game", "Rematch" and "Start Game" buttons after a game ends,
 * overlaying a configurable countdown timer. Breaks the "one more game" loop
 * by inserting a pause between games — especially valuable after losses (tilt).
 */
export const chessPostGameCooldown: ShieldDefinition = {
  id: "chess-post-game-cooldown",
  name: "Post-Game Cooldown",
  description: "Pauses before you can start a new game after finishing one",
  domain: "chess.com",
  icon: "♟️",
  mechanism: "friction",
  defaultEnabled: true,
};
