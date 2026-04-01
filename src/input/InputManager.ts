/**
 * Input Manager
 * Unified input handling for mouse, touch, and keyboard with gesture recognition
 */

import type { Vec2, InputAction, InputState } from '@typedefs/index';
import { EventManager } from '@core/EventManager';

export interface GestureEvent {
  type: 'tap' | 'swipe' | 'longpress' | 'pinch';
  position: Vec2;
  direction?: Vec2;
  distance?: number;
  duration?: number;
  scale?: number;
}

export class InputManager {
  private static instance: InputManager;
  private events: EventManager;
  private canvas: HTMLCanvasElement | null = null;
  private state: InputState;
  private previousState: InputState;

  // Touch tracking
  private touchStartPos: Vec2 | null = null;
  private touchStartTime: number = 0;
  private isTouching: boolean = false;
  private longPressTimer: number | null = null;
  private longPressThreshold: number = 500;

  // Gesture thresholds
  private swipeThreshold: number = 50;
  private tapThreshold: number = 10;

  // Key bindings
  private keyBindings: Map<string, InputAction> = new Map();

  // Bound event handlers for cleanup
  private boundHandlers: { [key: string]: EventListener } = {};

  private constructor() {
    this.events = EventManager.getInstance();
    this.state = this.createEmptyState();
    this.previousState = this.createEmptyState();

    this.setupDefaultBindings();
  }

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.setupEventListeners();
    this.events.emit('input:initialized', {});
  }

  private createEmptyState(): InputState {
    return {
      mousePosition: { x: 0, y: 0 },
      mouseDelta: { x: 0, y: 0 },
      isMouseDown: false,
      wasMouseDown: false,
      keys: new Map(),
      actions: new Map(),
    };
  }

  private setupDefaultBindings(): void {
    this.keyBindings.set('Escape', 'pause' as InputAction);
    this.keyBindings.set('p', 'pause' as InputAction);
    this.keyBindings.set('1', 'powerup_1' as InputAction);
    this.keyBindings.set('2', 'powerup_2' as InputAction);
    this.keyBindings.set('3', 'powerup_3' as InputAction);
  }

  private setupEventListeners(): void {
    if (!this.canvas) return;

    // Mouse events
    this.boundHandlers['mousedown'] = this.onMouseDown.bind(this) as EventListener;
    this.boundHandlers['mouseup'] = this.onMouseUp.bind(this) as EventListener;
    this.boundHandlers['mousemove'] = this.onMouseMove.bind(this) as EventListener;
    this.boundHandlers['contextmenu'] = ((e: Event) => e.preventDefault()) as EventListener;

    this.canvas.addEventListener('mousedown', this.boundHandlers['mousedown']);
    this.canvas.addEventListener('mouseup', this.boundHandlers['mouseup']);
    this.canvas.addEventListener('mousemove', this.boundHandlers['mousemove']);
    this.canvas.addEventListener('contextmenu', this.boundHandlers['contextmenu']);

    // Touch events
    this.boundHandlers['touchstart'] = this.onTouchStart.bind(this) as EventListener;
    this.boundHandlers['touchend'] = this.onTouchEnd.bind(this) as EventListener;
    this.boundHandlers['touchmove'] = this.onTouchMove.bind(this) as EventListener;
    this.boundHandlers['touchcancel'] = this.onTouchCancel.bind(this) as EventListener;

    this.canvas.addEventListener('touchstart', this.boundHandlers['touchstart'], { passive: false });
    this.canvas.addEventListener('touchend', this.boundHandlers['touchend'], { passive: false });
    this.canvas.addEventListener('touchmove', this.boundHandlers['touchmove'], { passive: false });
    this.canvas.addEventListener('touchcancel', this.boundHandlers['touchcancel']);

    // Keyboard events
    this.boundHandlers['keydown'] = this.onKeyDown.bind(this) as EventListener;
    this.boundHandlers['keyup'] = this.onKeyUp.bind(this) as EventListener;

    window.addEventListener('keydown', this.boundHandlers['keydown']);
    window.addEventListener('keyup', this.boundHandlers['keyup']);
  }

  private getCanvasPosition(clientX: number, clientY: number): Vec2 {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private onMouseDown(e: MouseEvent): void {
    const pos = this.getCanvasPosition(e.clientX, e.clientY);
    this.state.isMouseDown = true;
    this.state.mousePosition = pos;

    this.events.emit('input:mousedown', { position: pos, button: e.button });

    if (e.button === 0) {
      this.events.emit('input:click', { position: pos });
    }
  }

  private onMouseUp(e: MouseEvent): void {
    const pos = this.getCanvasPosition(e.clientX, e.clientY);
    this.state.isMouseDown = false;
    this.state.mousePosition = pos;

    this.events.emit('input:mouseup', { position: pos, button: e.button });
  }

  private onMouseMove(e: MouseEvent): void {
    const pos = this.getCanvasPosition(e.clientX, e.clientY);
    this.state.mouseDelta = {
      x: pos.x - this.state.mousePosition.x,
      y: pos.y - this.state.mousePosition.y,
    };
    this.state.mousePosition = pos;

    this.events.emit('input:mousemove', { position: pos, delta: this.state.mouseDelta });
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const pos = this.getCanvasPosition(touch.clientX, touch.clientY);

    this.state.isMouseDown = true;
    this.state.mousePosition = pos;
    this.touchStartPos = { ...pos };
    this.touchStartTime = performance.now();
    this.isTouching = true;

    // Long press detection
    this.longPressTimer = window.setTimeout(() => {
      if (this.isTouching && this.touchStartPos) {
        const gesture: GestureEvent = {
          type: 'longpress',
          position: this.touchStartPos,
          duration: performance.now() - this.touchStartTime,
        };
        this.events.emit('input:gesture', gesture);
      }
    }, this.longPressThreshold);

    this.events.emit('input:touchstart', { position: pos });
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    this.state.isMouseDown = false;
    this.isTouching = false;

    if (this.touchStartPos) {
      const pos = this.state.mousePosition;
      const dx = pos.x - this.touchStartPos.x;
      const dy = pos.y - this.touchStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = performance.now() - this.touchStartTime;

      if (distance < this.tapThreshold) {
        // Tap gesture
        const gesture: GestureEvent = { type: 'tap', position: pos, duration };
        this.events.emit('input:gesture', gesture);
        this.events.emit('input:click', { position: pos });
      } else if (distance >= this.swipeThreshold) {
        // Swipe gesture
        const gesture: GestureEvent = {
          type: 'swipe',
          position: this.touchStartPos,
          direction: { x: dx / distance, y: dy / distance },
          distance,
          duration,
        };
        this.events.emit('input:gesture', gesture);
      }
    }

    this.touchStartPos = null;
    this.events.emit('input:touchend', { position: this.state.mousePosition });
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const pos = this.getCanvasPosition(touch.clientX, touch.clientY);

    this.state.mouseDelta = {
      x: pos.x - this.state.mousePosition.x,
      y: pos.y - this.state.mousePosition.y,
    };
    this.state.mousePosition = pos;
  }

  private onTouchCancel(_e: TouchEvent): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.state.isMouseDown = false;
    this.isTouching = false;
    this.touchStartPos = null;
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.state.keys.set(e.key, true);

    const action = this.keyBindings.get(e.key);
    if (action) {
      this.state.actions.set(action, true);
      this.events.emit('input:action', { action, pressed: true });
    }

    this.events.emit('input:keydown', { key: e.key, code: e.code });
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.state.keys.set(e.key, false);

    const action = this.keyBindings.get(e.key);
    if (action) {
      this.state.actions.set(action, false);
      this.events.emit('input:action', { action, pressed: false });
    }

    this.events.emit('input:keyup', { key: e.key, code: e.code });
  }

  /**
   * Update input state — call once per frame
   */
  update(): void {
    this.previousState.wasMouseDown = this.state.isMouseDown;
    this.state.mouseDelta = { x: 0, y: 0 };
  }

  // Public API
  getMousePosition(): Vec2 { return { ...this.state.mousePosition }; }
  isMouseDown(): boolean { return this.state.isMouseDown; }
  wasMouseJustPressed(): boolean { return this.state.isMouseDown && !this.previousState.wasMouseDown; }
  wasMouseJustReleased(): boolean { return !this.state.isMouseDown && this.previousState.wasMouseDown; }
  isKeyDown(key: string): boolean { return this.state.keys.get(key) || false; }
  isActionActive(action: InputAction): boolean { return this.state.actions.get(action) || false; }

  bindKey(key: string, action: InputAction): void { this.keyBindings.set(key, action); }
  unbindKey(key: string): void { this.keyBindings.delete(key); }

  getState(): InputState { return { ...this.state }; }

  destroy(): void {
    if (this.canvas) {
      for (const [event, handler] of Object.entries(this.boundHandlers)) {
        this.canvas.removeEventListener(event, handler);
        window.removeEventListener(event, handler);
      }
    }
    if (this.longPressTimer) { clearTimeout(this.longPressTimer); }
  }
}

export const Input = InputManager.getInstance();
