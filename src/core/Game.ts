/**
 * Game Core
 * Main game orchestrator — manages the game loop, state machine, and all subsystems
 */

import { ECSWorld, World } from './ECS';
import { EventManager, Events } from './EventManager';
import { StateMachine, createGameStateMachine } from './StateMachine';
import { Camera } from './Camera';
import { WebGLRenderer } from '@renderers/WebGLRenderer';
import { AudioManager } from '@audio/AudioManager';
import { InputManager } from '@input/InputManager';
import { AssetManager } from '@managers/AssetManager';
import { SaveSystem } from '@managers/SaveManager';
import { AnalyticsSystem } from '@managers/AnalyticsManager';
import { ParticleSystem } from '@systems/ParticleSystem';
import { GAME_CONFIG, CANVAS_CONFIG } from '@config/GameConfig';
import { GameState } from '@typedefs/index';

interface GameContext {
  game: Game;
  world: ECSWorld;
  renderer: WebGLRenderer;
  audio: AudioManager;
  input: InputManager;
  camera: Camera;
  particles: ParticleSystem;
  assets: AssetManager;
  save: SaveSystem;
  analytics: AnalyticsSystem;
}

export class Game {
  // Subsystems
  private renderer!: WebGLRenderer;
  private audio: AudioManager;
  private input: InputManager;
  private camera: Camera;
  private particles: ParticleSystem;
  private assets: AssetManager;
  private save: SaveSystem;
  private analytics: AnalyticsSystem;
  private world: ECSWorld;
  private events: EventManager;
  private stateMachine: StateMachine<GameContext>;

  // Game loop
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = GAME_CONFIG.fixedTimeStep;
  private maxDeltaTime: number = GAME_CONFIG.maxDeltaTime;

  // Performance tracking
  private frameCount: number = 0;
  private fpsTimer: number = 0;
  private currentFPS: number = 0;

  // DOM elements
  private canvas!: HTMLCanvasElement;

  constructor() {
    this.world = World;
    this.events = Events;
    this.audio = AudioManager.getInstance();
    this.input = InputManager.getInstance();
    this.camera = new Camera(CANVAS_CONFIG.width, CANVAS_CONFIG.height);
    this.particles = new ParticleSystem();
    this.assets = AssetManager.getInstance();
    this.save = SaveSystem.getInstance();
    this.analytics = AnalyticsSystem.getInstance();

    const context: GameContext = {
      game: this,
      world: this.world,
      renderer: null as unknown as WebGLRenderer,
      audio: this.audio,
      input: this.input,
      camera: this.camera,
      particles: this.particles,
      assets: this.assets,
      save: this.save,
      analytics: this.analytics,
    };

    this.stateMachine = createGameStateMachine(context);
    this.registerStates();
  }

  async initialize(): Promise<void> {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    this.canvas.width = CANVAS_CONFIG.width * CANVAS_CONFIG.pixelRatio;
    this.canvas.height = CANVAS_CONFIG.height * CANVAS_CONFIG.pixelRatio;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    const container = document.getElementById('game-container');
    if (container) {
      container.insertBefore(this.canvas, container.firstChild);
    }

    // Initialize renderer
    this.renderer = new WebGLRenderer(this.canvas);

    // Initialize input
    this.input.initialize(this.canvas);

    // Initialize audio
    await this.audio.initialize();

    // Initialize analytics
    this.analytics.initialize();

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();

    // Setup UI event handlers
    this.setupUIHandlers();

    // Register game systems
    this.registerSystems();

    // Start state machine
    await this.stateMachine.transitionTo(GameState.BOOT, true);

    this.events.emit('game:initialized', {});
  }

  private registerStates(): void {
    this.stateMachine
      .registerState({
        name: GameState.BOOT,
        onEnter: async () => {
          this.showScreen('loading-screen');
          // Simulate boot sequence
          await new Promise(resolve => setTimeout(resolve, 500));
        },
      })
      .registerState({
        name: GameState.LOADING,
        onEnter: async () => {
          this.showScreen('loading-screen');
          // Load assets here in the future
          await new Promise(resolve => setTimeout(resolve, 800));
        },
      })
      .registerState({
        name: GameState.MENU,
        onEnter: () => {
          this.showScreen('main-menu');
          this.hideElement('hud');
          this.hideElement('pause-menu');
        },
      })
      .registerState({
        name: GameState.PLAYING,
        onEnter: () => {
          this.hideElement('main-menu');
          this.hideElement('loading-screen');
          this.hideElement('pause-menu');
          this.showElement('hud');
          document.getElementById('hud')?.classList.add('active');
          this.analytics.trackProgression('start', 'wave_1');
        },
        onUpdate: (_ctx, deltaTime) => {
          this.world.update(deltaTime);
          this.particles.update(deltaTime);
          this.camera.update(deltaTime);
        },
        onPause: () => {
          // Pause game logic
        },
        onResume: () => {
          // Resume game logic
        },
      })
      .registerState({
        name: GameState.PAUSED,
        onEnter: () => {
          this.showElement('pause-menu');
          document.getElementById('pause-menu')?.classList.add('active');
        },
        onExit: () => {
          this.hideElement('pause-menu');
          document.getElementById('pause-menu')?.classList.remove('active');
        },
      })
      .registerState({
        name: GameState.GAME_OVER,
        onEnter: () => {
          this.analytics.trackProgression('fail', 'game_over');
          // Show game over screen
        },
      })
      .registerState({
        name: GameState.VICTORY,
        onEnter: () => {
          this.analytics.trackProgression('complete', 'victory');
          // Show victory screen
        },
      });

    // Register transitions
    this.stateMachine
      .registerTransition({ from: GameState.BOOT, to: GameState.LOADING })
      .registerTransition({ from: GameState.LOADING, to: GameState.MENU })
      .registerTransition({ from: GameState.MENU, to: GameState.PLAYING })
      .registerTransition({ from: GameState.PLAYING, to: GameState.PAUSED })
      .registerTransition({ from: GameState.PAUSED, to: GameState.PLAYING })
      .registerTransition({ from: GameState.PLAYING, to: GameState.GAME_OVER })
      .registerTransition({ from: GameState.PLAYING, to: GameState.VICTORY })
      .registerTransition({ from: GameState.GAME_OVER, to: GameState.MENU })
      .registerTransition({ from: GameState.VICTORY, to: GameState.MENU });
  }

  private registerSystems(): void {
    // ECS Systems will be registered here as they are built
    // e.g., world.registerSystem(new MovementSystem(this.world));
  }

  private setupUIHandlers(): void {
    // Start button
    document.getElementById('start-button')?.addEventListener('click', async () => {
      await this.audio.resume();
      await this.stateMachine.transitionTo(GameState.PLAYING, true);
    });

    // Pause button
    document.getElementById('pause-button')?.addEventListener('click', () => {
      if (this.stateMachine.isInState(GameState.PLAYING)) {
        this.stateMachine.pushState(GameState.PAUSED);
      }
    });

    // Resume button
    document.getElementById('resume-button')?.addEventListener('click', () => {
      if (this.stateMachine.isInState(GameState.PAUSED)) {
        this.stateMachine.popState();
      }
    });

    // Restart button
    document.getElementById('restart-button')?.addEventListener('click', async () => {
      await this.stateMachine.transitionTo(GameState.PLAYING, true);
    });

    // Quit button
    document.getElementById('quit-button')?.addEventListener('click', async () => {
      await this.stateMachine.transitionTo(GameState.MENU, true);
    });

    // Settings button
    document.getElementById('settings-button')?.addEventListener('click', () => {
      const panel = document.getElementById('settings-panel');
      if (panel) panel.style.display = 'flex';
    });

    // Close settings
    document.getElementById('close-settings')?.addEventListener('click', () => {
      const panel = document.getElementById('settings-panel');
      if (panel) panel.style.display = 'none';
    });

    // Volume controls
    document.getElementById('master-volume')?.addEventListener('input', (e) => {
      this.audio.setMasterVolume(parseFloat((e.target as HTMLInputElement).value));
    });

    document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
      this.audio.setSFXVolume(parseFloat((e.target as HTMLInputElement).value));
    });

    document.getElementById('music-volume')?.addEventListener('input', (e) => {
      this.audio.setMusicVolume(parseFloat((e.target as HTMLInputElement).value));
    });

    // Fullscreen
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // Keyboard pause
    this.events.on('input:action', (data: unknown) => {
      const { action, pressed } = data as { action: string; pressed: boolean };
      if (action === 'pause' && pressed) {
        if (this.stateMachine.isInState(GameState.PLAYING)) {
          this.stateMachine.pushState(GameState.PAUSED);
        } else if (this.stateMachine.isInState(GameState.PAUSED)) {
          this.stateMachine.popState();
        }
      }
    });
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    this.events.emit('game:started', {});
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.events.emit('game:stopped', {});
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const rawDelta = currentTime - this.lastTime;
    const deltaTime = Math.min(rawDelta, this.maxDeltaTime);
    this.lastTime = currentTime;

    // FPS tracking
    this.frameCount++;
    this.fpsTimer += deltaTime;
    if (this.fpsTimer >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1000;
    }

    // Fixed timestep accumulator
    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.world.fixedUpdate(this.fixedTimeStep / 1000);
      this.accumulator -= this.fixedTimeStep;
    }

    // Variable update
    const dt = deltaTime / 1000;
    this.stateMachine.update(dt);
    this.input.update();
    this.audio.update();
    this.events.processQueue();

    // Render
    const interpolation = this.accumulator / this.fixedTimeStep;
    this.render(interpolation);

    // Request next frame
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private render(_interpolation: number): void {
    this.renderer.beginFrame();

    // Render game world
    this.world.render(_interpolation);

    // Render particles
    const particles = this.particles.getParticles();
    for (const p of particles) {
      this.renderer.drawRect(
        { x: p.position.x - p.size / 2, y: p.position.y - p.size / 2, width: p.size, height: p.size },
        p.color,
        p.rotation
      );
    }

    this.renderer.endFrame();
  }

  private handleResize(): void {
    const container = document.getElementById('game-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.canvas.width = width * CANVAS_CONFIG.pixelRatio;
    this.canvas.height = height * CANVAS_CONFIG.pixelRatio;

    this.renderer.resize(this.canvas.width, this.canvas.height);
    this.camera.setViewport(width, height);
  }

  // UI helpers
  private showScreen(id: string): void {
    const screens = ['main-menu', 'loading-screen', 'pause-menu'];
    for (const screenId of screens) {
      const el = document.getElementById(screenId);
      if (el) {
        el.style.display = screenId === id ? 'flex' : 'none';
        el.classList.toggle('active', screenId === id);
      }
    }
  }

  private showElement(id: string): void {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
  }

  private hideElement(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  }

  // Public API
  getFPS(): number { return this.currentFPS; }
  getRenderer(): WebGLRenderer { return this.renderer; }
  getCamera(): Camera { return this.camera; }
  getParticles(): ParticleSystem { return this.particles; }
  getWorld(): ECSWorld { return this.world; }
  getStateMachine(): StateMachine<GameContext> { return this.stateMachine; }

  destroy(): void {
    this.stop();
    this.renderer.destroy();
    this.audio.destroy();
    this.input.destroy();
    this.analytics.destroy();
    this.world.clear();
    this.events.clear();
    this.particles.clear();
  }
}

// Global game instance
export const GameInstance = new Game();
