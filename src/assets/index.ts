/**
 * Assets Module - Barrel Export
 * Central entry point for all procedural game assets
 */

// Bug Sprites
export {
  generateBugSpriteSheet,
  generateAllBugSprites,
  getBugSpriteCanvas,
} from './BugSprites';
export type { BugAnimationState } from './BugSprites';

// Particle Textures
export {
  generateParticleAtlas,
  generateBloodTextures,
  generateExplosionTextures,
  generateSparkTextures,
  generateDustTextures,
  generateSmokeTextures,
  generateScoreTextures,
} from './ParticleTextures';
export type { ParticleAtlas } from './ParticleTextures';

// Background
export {
  generateBackgroundTile,
  generateFullBackground,
  generateMenuBackground,
} from './BackgroundGen';

// Power-Up Icons
export {
  generatePowerUpIcon,
  generateAllPowerUpIcons,
} from './PowerUpIcons';
export type { PowerUpType } from './PowerUpIcons';

// Cursor
export {
  getCrosshairDataURI,
  getSmashDataURI,
  getCrosshairSVG,
  getSmashSVG,
  createCursorStyle,
} from './Cursor';

// Title Art
export {
  generateTitleFrame,
  TitleRenderer,
  generateGameOverTitle,
  generateVictoryTitle,
} from './TitleArt';

// HUD Art
export {
  generateHealthBar,
  generateBossHealthBar,
  generateWaveBanner,
  generateScoreFrame,
  generateKillCounter,
  generateComboDisplay,
} from './HUDArt';

// Achievement Badges
export {
  generateBadge,
  generateAllBadges,
} from './Badges';
export type { BadgeType } from './Badges';

// ─── ASSET INITIALIZATION ──────────────────────────────────────────────────

import { generateAllBugSprites } from './BugSprites';
import { generateParticleAtlas } from './ParticleTextures';
import { generateAllPowerUpIcons } from './PowerUpIcons';
import { generateAllBadges } from './Badges';

export interface PreGeneratedAssets {
  bugSprites: ReturnType<typeof generateAllBugSprites>;
  particleAtlas: ReturnType<typeof generateParticleAtlas>;
  powerUpIcons: ReturnType<typeof generateAllPowerUpIcons>;
  badges: ReturnType<typeof generateAllBadges>;
}

/**
 * Pre-generate all procedural assets at startup.
 * Call once during game initialization to warm caches.
 */
export function initAssets(): PreGeneratedAssets {
  return {
    bugSprites: generateAllBugSprites(),
    particleAtlas: generateParticleAtlas(),
    powerUpIcons: generateAllPowerUpIcons(),
    badges: generateAllBadges(),
  };
}
