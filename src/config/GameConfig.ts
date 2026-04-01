/**
 * Game Configuration
 * Centralized configuration for all game systems
 */

import type { GameConfig, Difficulty, BugDefinition, WaveConfig } from '@typedefs/index';
import { BugType, BehaviorType, PowerUpType } from '@typedefs/index';

export const GAME_CONFIG: GameConfig = {
  targetFPS: 60,
  fixedTimeStep: 1000 / 60,
  maxDeltaTime: 100,
  enableVSync: true,
  enablePostProcessing: true,
  particleLimit: 1000,
  audioEnabled: true,
  debugMode: false,
};

export const CANVAS_CONFIG = {
  width: 1920,
  height: 1080,
  backgroundColor: '#1a1a2e',
  pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, {
  spawnRateMultiplier: number;
  bugSpeedMultiplier: number;
  bugHealthMultiplier: number;
  scoreMultiplier: number;
}> = {
  easy: { spawnRateMultiplier: 0.7, bugSpeedMultiplier: 0.6, bugHealthMultiplier: 0.5, scoreMultiplier: 0.8 },
  normal: { spawnRateMultiplier: 1.0, bugSpeedMultiplier: 1.0, bugHealthMultiplier: 1.0, scoreMultiplier: 1.0 },
  hard: { spawnRateMultiplier: 1.5, bugSpeedMultiplier: 1.4, bugHealthMultiplier: 1.5, scoreMultiplier: 1.5 },
  nightmare: { spawnRateMultiplier: 2.5, bugSpeedMultiplier: 2.0, bugHealthMultiplier: 2.5, scoreMultiplier: 3.0 },
};

export const BUG_DEFINITIONS: Record<BugType, BugDefinition> = {
  [BugType.ANT]: {
    type: BugType.ANT,
    stats: { health: 10, maxHealth: 10, speed: 80, damage: 5, scoreValue: 10, spawnWeight: 40 },
    spriteKey: 'ant', animationSpeed: 8, scale: 0.8, behaviors: [BehaviorType.WANDER, BehaviorType.FLEE],
  },
  [BugType.BEETLE]: {
    type: BugType.BEETLE,
    stats: { health: 25, maxHealth: 25, speed: 50, damage: 10, scoreValue: 25, spawnWeight: 25 },
    spriteKey: 'beetle', animationSpeed: 6, scale: 1.0, behaviors: [BehaviorType.WANDER, BehaviorType.CHASE],
  },
  [BugType.SPIDER]: {
    type: BugType.SPIDER,
    stats: { health: 15, maxHealth: 15, speed: 120, damage: 8, scoreValue: 20, spawnWeight: 20 },
    spriteKey: 'spider', animationSpeed: 12, scale: 0.9, behaviors: [BehaviorType.CHASE, BehaviorType.DASH],
  },
  [BugType.WASP]: {
    type: BugType.WASP,
    stats: { health: 12, maxHealth: 12, speed: 180, damage: 12, scoreValue: 35, spawnWeight: 10 },
    spriteKey: 'wasp', animationSpeed: 15, scale: 0.7, behaviors: [BehaviorType.CIRCLE, BehaviorType.DASH, BehaviorType.FLEE],
  },
  [BugType.MANTIS]: {
    type: BugType.MANTIS,
    stats: { health: 40, maxHealth: 40, speed: 100, damage: 20, scoreValue: 50, spawnWeight: 5 },
    spriteKey: 'mantis', animationSpeed: 10, scale: 1.2, behaviors: [BehaviorType.ZIGZAG, BehaviorType.CHASE, BehaviorType.DASH],
  },
  [BugType.BOSS_SCARAB]: {
    type: BugType.BOSS_SCARAB,
    stats: { health: 500, maxHealth: 500, speed: 60, damage: 50, scoreValue: 1000, spawnWeight: 0 },
    spriteKey: 'boss_scarab', animationSpeed: 4, scale: 3.0, behaviors: [BehaviorType.CHASE, BehaviorType.CIRCLE, BehaviorType.DASH],
  },
  [BugType.BOSS_TARANTULA]: {
    type: BugType.BOSS_TARANTULA,
    stats: { health: 800, maxHealth: 800, speed: 90, damage: 75, scoreValue: 2000, spawnWeight: 0 },
    spriteKey: 'boss_tarantula', animationSpeed: 6, scale: 3.5, behaviors: [BehaviorType.CHASE, BehaviorType.ZIGZAG, BehaviorType.DASH],
  },
};

export const WAVE_CONFIGS: WaveConfig[] = [
  { waveNumber: 1, duration: 30000, spawnRate: 2000, bugTypes: [BugType.ANT], bugCount: 15, bossWave: false },
  { waveNumber: 2, duration: 35000, spawnRate: 1800, bugTypes: [BugType.ANT, BugType.BEETLE], bugCount: 25, bossWave: false },
  { waveNumber: 3, duration: 40000, spawnRate: 1500, bugTypes: [BugType.ANT, BugType.BEETLE, BugType.SPIDER], bugCount: 35, bossWave: false },
  { waveNumber: 4, duration: 45000, spawnRate: 1200, bugTypes: [BugType.BEETLE, BugType.SPIDER, BugType.WASP], bugCount: 40, bossWave: false },
  { waveNumber: 5, duration: 60000, spawnRate: 1000, bugTypes: [BugType.BEETLE, BugType.SPIDER, BugType.WASP, BugType.MANTIS], bugCount: 50, bossWave: true },
];

export const POWERUP_CONFIGS = {
  [PowerUpType.TIME_FREEZE]: { duration: 5000, cooldown: 30000, color: '#00ffff' },
  [PowerUpType.MULTIPLIER]: { duration: 10000, cooldown: 45000, multiplier: 2, color: '#ffff00' },
  [PowerUpType.NUKE]: { duration: 0, cooldown: 60000, damage: 9999, color: '#ff0000' },
  [PowerUpType.SHIELD]: { duration: 8000, cooldown: 40000, color: '#00ff00' },
  [PowerUpType.RAPID_FIRE]: { duration: 5000, cooldown: 35000, fireRate: 50, color: '#ff00ff' },
};

export const PARTICLE_CONFIGS = {
  blood: { count: 8, minSize: 2, maxSize: 6, minSpeed: 50, maxSpeed: 150, colors: ['#8B0000', '#FF0000', '#DC143C'], gravity: 200, life: 0.8 },
  explosion: { count: 20, minSize: 3, maxSize: 10, minSpeed: 100, maxSpeed: 300, colors: ['#FFA500', '#FF4500', '#FFD700', '#FFFFFF'], gravity: 100, life: 1.2 },
  spark: { count: 5, minSize: 1, maxSize: 3, minSpeed: 80, maxSpeed: 200, colors: ['#FFFF00', '#FFFFFF', '#00FFFF'], gravity: 50, life: 0.5 },
};

export const AUDIO_CONFIG = {
  audioEnabled: true,
  masterVolume: 1.0,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  maxConcurrentSounds: 32,
  spatialAudio: true,
  audioRange: 500,
};
