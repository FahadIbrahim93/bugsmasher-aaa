/**
 * Core Type Definitions for BugSmasher AAA
 * Enterprise-grade type safety and interfaces
 */

// ============================================================================
// VECTOR & MATH TYPES
// ============================================================================

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface Transform {
  position: Vec2;
  rotation: number;
  scale: Vec2;
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

export enum GameState {
  BOOT = 'boot',
  LOADING = 'loading',
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  VICTORY = 'victory',
}

export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  NIGHTMARE = 'nightmare',
}

export interface GameConfig {
  targetFPS: number;
  fixedTimeStep: number;
  maxDeltaTime: number;
  enableVSync: boolean;
  enablePostProcessing: boolean;
  particleLimit: number;
  audioEnabled: boolean;
  debugMode: boolean;
}

// ============================================================================
// ENTITY COMPONENT SYSTEM TYPES
// ============================================================================

export type EntityId = string;
export type ComponentType = string;

export interface Component {
  readonly type: ComponentType;
  enabled: boolean;
  entityId?: EntityId;
}

export interface TransformComponent extends Component {
  position: Vec2;
  rotation: number;
  scale: Vec2;
}

export interface VelocityComponent extends Component {
  velocity: Vec2;
  angularVelocity: number;
}

export interface SpriteComponent extends Component {
  spriteKey: string;
  width: number;
  height: number;
  color: Color;
}

export interface ColliderComponent extends Component {
  radius: number;
}

export interface HealthComponent extends Component {
  health: number;
  maxHealth: number;
  flashTimer: number;
}

export interface BugBehaviorComponent extends Component {
  bugType: BugType;
  state: BugState;
  behaviors: BehaviorType[];
  speed: number;
  scoreValue: number;
  stateTimer: number;
  target: Vec2 | null;
}

export interface Entity {
  readonly id: EntityId;
  readonly components: Map<ComponentType, Component>;
  active: boolean;
  tag?: string;
  layer: number;
}

export type SystemPriority = 'critical' | 'high' | 'normal' | 'low';

export interface System {
  readonly name: string;
  readonly priority: SystemPriority;
  enabled: boolean;
  update(deltaTime: number): void;
  fixedUpdate?(fixedDeltaTime: number): void;
  render?(interpolation: number): void;
  onEntityAdded?(entity: Entity): void;
  onEntityRemoved?(entity: Entity): void;
}

// ============================================================================
// BUG/ENEMY TYPES
// ============================================================================

export enum BugType {
  ANT = 'ant',
  BEETLE = 'beetle',
  SPIDER = 'spider',
  WASP = 'wasp',
  MANTIS = 'mantis',
  BOSS_SCARAB = 'boss_scarab',
  BOSS_TARANTULA = 'boss_tarantula',
}

export enum BugState {
  SPAWNING = 'spawning',
  IDLE = 'idle',
  MOVING = 'moving',
  ATTACKING = 'attacking',
  FLEEING = 'fleeing',
  DYING = 'dying',
  DEAD = 'dead',
}

export interface BugStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  scoreValue: number;
  spawnWeight: number;
}

export interface BugDefinition {
  type: BugType;
  stats: BugStats;
  spriteKey: string;
  animationSpeed: number;
  scale: number;
  behaviors: BehaviorType[];
}

export enum BehaviorType {
  WANDER = 'wander',
  CHASE = 'chase',
  FLEE = 'flee',
  CIRCLE = 'circle',
  ZIGZAG = 'zigzag',
  DASH = 'dash',
}

// ============================================================================
// RENDERING TYPES
// ============================================================================

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Particle {
  id: string;
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  life: number;
  maxLife: number;
  size: number;
  color: Color;
  rotation: number;
  rotationSpeed: number;
  sprite?: string;
}

export interface Camera {
  position: Vec2;
  zoom: number;
  rotation: number;
  viewport: Rect;
  shakeIntensity: number;
  shakeDecay: number;
}

export enum RenderLayer {
  BACKGROUND = 0,
  SHADOWS = 100,
  ENTITIES = 200,
  PARTICLES = 300,
  UI = 400,
  OVERLAY = 500,
}

// ============================================================================
// AUDIO TYPES
// ============================================================================

export enum SoundType {
  SQUISH = 'squish',
  BUZZ = 'buzz',
  WING_FLAP = 'wing_flap',
  STEP = 'step',
  MUSIC_MENU = 'music_menu',
  MUSIC_GAME = 'music_game',
  MUSIC_BOSS = 'music_boss',
  UI_CLICK = 'ui_click',
  UI_HOVER = 'ui_hover',
  POWERUP = 'powerup',
  GAME_OVER = 'game_over',
  VICTORY = 'victory',
}

export interface SoundConfig {
  volume: number;
  loop: boolean;
  playbackRate: number;
  spatial?: boolean;
  position?: Vec2;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export enum InputAction {
  PRIMARY_CLICK = 'primary_click',
  SECONDARY_CLICK = 'secondary_click',
  PAUSE = 'pause',
  POWERUP_1 = 'powerup_1',
  POWERUP_2 = 'powerup_2',
  POWERUP_3 = 'powerup_3',
}

export interface InputState {
  mousePosition: Vec2;
  mouseDelta: Vec2;
  isMouseDown: boolean;
  wasMouseDown: boolean;
  keys: Map<string, boolean>;
  actions: Map<InputAction, boolean>;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface UITheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
}

export enum UIEvent {
  BUTTON_CLICK = 'button_click',
  SCORE_UPDATE = 'score_update',
  HEALTH_UPDATE = 'health_update',
  WAVE_UPDATE = 'wave_update',
  GAME_START = 'game_start',
  GAME_PAUSE = 'game_pause',
  GAME_RESUME = 'game_resume',
  GAME_OVER = 'game_over',
}

// ============================================================================
// GAME PROGRESSION TYPES
// ============================================================================

export interface WaveConfig {
  waveNumber: number;
  duration: number;
  spawnRate: number;
  bugTypes: BugType[];
  bugCount: number;
  bossWave: boolean;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  duration: number;
  active: boolean;
}

export enum PowerUpType {
  TIME_FREEZE = 'time_freeze',
  MULTIPLIER = 'multiplier',
  NUKE = 'nuke',
  SHIELD = 'shield',
  RAPID_FIRE = 'rapid_fire',
}

export interface PlayerStats {
  score: number;
  highScore: number;
  bugsKilled: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
  wavesCompleted: number;
  playTime: number;
}

// ============================================================================
// EVENT SYSTEM TYPES
// ============================================================================

export interface GameEvent {
  type: string;
  timestamp: number;
  data?: unknown;
  source?: string;
}

export type EventCallback<T = unknown> = (event: T) => void;

export interface EventSubscription {
  id: string;
  type: string;
  callback: EventCallback;
  priority: number;
  once: boolean;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  entityCount: number;
  particleCount: number;
  memoryUsage: number;
  gcTime: number;
}

export interface ProfilingData {
  systemName: string;
  avgTime: number;
  maxTime: number;
  callCount: number;
}
