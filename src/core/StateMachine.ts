/**
 * State Machine
 * Type-safe hierarchical state machine for game state management
 */

import { EventManager } from '@core/EventManager';

export interface StateConfig<TContext = unknown> {
  name: string;
  onEnter?: (context: TContext, fromState?: string) => void | Promise<void>;
  onUpdate?: (context: TContext, deltaTime: number) => void;
  onExit?: (context: TContext, toState?: string) => void | Promise<void>;
  onPause?: (context: TContext) => void;
  onResume?: (context: TContext) => void;
  parent?: string;
}

export interface StateTransition<TContext = unknown> {
  from: string | string[];
  to: string;
  condition?: (context: TContext) => boolean;
  action?: (context: TContext) => void;
}

export class StateMachine<TContext = unknown> {
  private states: Map<string, StateConfig<TContext>> = new Map();
  private transitions: Map<string, StateTransition<TContext>[]> = new Map();
  private currentState: string | null = null;
  private previousState: string | null = null;
  private stateStack: string[] = [];
  private context: TContext;
  private events: EventManager;
  private isTransitioning: boolean = false;
  private transitionQueue: Array<{ to: string; force?: boolean }> = [];

  constructor(context: TContext) {
    this.context = context;
    this.events = EventManager.getInstance();
  }

  /**
   * Register a state
   */
  registerState(config: StateConfig<TContext>): this {
    this.states.set(config.name, config);

    if (!this.transitions.has(config.name)) {
      this.transitions.set(config.name, []);
    }

    this.events.emit('state:registered', { state: config.name });
    return this;
  }

  /**
   * Register multiple states
   */
  registerStates(configs: StateConfig<TContext>[]): this {
    for (const config of configs) {
      this.registerState(config);
    }
    return this;
  }

  /**
   * Register a transition
   */
  registerTransition(transition: StateTransition<TContext>): this {
    const fromStates = Array.isArray(transition.from) ? transition.from : [transition.from];

    for (const from of fromStates) {
      if (!this.transitions.has(from)) {
        this.transitions.set(from, []);
      }
      this.transitions.get(from)!.push(transition);
    }

    return this;
  }

  /**
   * Transition to a new state
   */
  async transitionTo(stateName: string, force: boolean = false): Promise<boolean> {
    // Queue if already transitioning
    if (this.isTransitioning && !force) {
      this.transitionQueue.push({ to: stateName, force });
      return false;
    }

    const targetState = this.states.get(stateName);
    if (!targetState) {
      console.error(`State not found: ${stateName}`);
      return false;
    }

    // Check if transition is valid
    if (!force && this.currentState) {
      const allowedTransitions = this.transitions.get(this.currentState) || [];
      const isValid = allowedTransitions.some(t =>
        (Array.isArray(t.from) ? t.from.includes(this.currentState!) : t.from === this.currentState) &&
        t.to === stateName
      );

      if (!isValid && this.currentState !== stateName) {
        // Allow self-transitions and explicit transitions
        console.warn(`Invalid transition from ${this.currentState} to ${stateName}`);
      }
    }

    this.isTransitioning = true;

    try {
      // Exit current state
      if (this.currentState) {
        const currentConfig = this.states.get(this.currentState);
        if (currentConfig?.onExit) {
          await currentConfig.onExit(this.context, stateName);
        }
      }

      // Update state tracking
      this.previousState = this.currentState;
      this.currentState = stateName;

      // Enter new state
      if (targetState.onEnter) {
        await targetState.onEnter(this.context, this.previousState || undefined);
      }

      this.events.emit('state:changed', {
        from: this.previousState,
        to: stateName,
        context: this.context,
      });

      return true;
    } catch (error) {
      console.error(`Error transitioning to state ${stateName}:`, error);
      return false;
    } finally {
      this.isTransitioning = false;

      // Process queued transitions
      if (this.transitionQueue.length > 0) {
        const next = this.transitionQueue.shift()!;
        this.transitionTo(next.to, next.force);
      }
    }
  }

  /**
   * Push state onto stack (for pause menus, etc.)
   */
  async pushState(stateName: string): Promise<boolean> {
    if (this.currentState) {
      const currentConfig = this.states.get(this.currentState);
      if (currentConfig?.onPause) {
        currentConfig.onPause(this.context);
      }
      this.stateStack.push(this.currentState);
    }

    return this.transitionTo(stateName, true);
  }

  /**
   * Pop state from stack
   */
  async popState(): Promise<boolean> {
    if (this.stateStack.length === 0) return false;

    const previousState = this.stateStack.pop()!;

    // Exit current state
    if (this.currentState) {
      const currentConfig = this.states.get(this.currentState);
      if (currentConfig?.onExit) {
        await currentConfig.onExit(this.context, previousState);
      }
    }

    this.previousState = this.currentState;
    this.currentState = previousState;

    // Resume previous state
    const config = this.states.get(previousState);
    if (config?.onResume) {
      config.onResume(this.context);
    }

    this.events.emit('state:popped', {
      to: previousState,
      context: this.context,
    });

    return true;
  }

  /**
   * Update current state
   */
  update(deltaTime: number): void {
    if (!this.currentState) return;

    const config = this.states.get(this.currentState);
    if (config?.onUpdate) {
      config.onUpdate(this.context, deltaTime);
    }

    // Check automatic transitions
    const transitions = this.transitions.get(this.currentState) || [];
    for (const transition of transitions) {
      if (transition.condition && transition.condition(this.context)) {
        if (transition.action) {
          transition.action(this.context);
        }
        this.transitionTo(transition.to);
        break;
      }
    }
  }

  /**
   * Get current state name
   */
  getCurrentState(): string | null {
    return this.currentState;
  }

  /**
   * Get previous state name
   */
  getPreviousState(): string | null {
    return this.previousState;
  }

  /**
   * Check if in specific state
   */
  isInState(stateName: string): boolean {
    return this.currentState === stateName;
  }

  /**
   * Check if can transition to state
   */
  canTransitionTo(stateName: string): boolean {
    if (!this.currentState) return true;

    const transitions = this.transitions.get(this.currentState) || [];
    return transitions.some(t => t.to === stateName);
  }

  /**
   * Get available transitions from current state
   */
  getAvailableTransitions(): string[] {
    if (!this.currentState) return [];

    const transitions = this.transitions.get(this.currentState) || [];
    return transitions.map(t => t.to);
  }

  /**
   * Get state hierarchy (for nested states)
   */
  getStateHierarchy(): string[] {
    const hierarchy: string[] = [];
    let current = this.currentState;

    while (current) {
      hierarchy.unshift(current);
      const config = this.states.get(current);
      current = config?.parent || null;
    }

    return hierarchy;
  }

  /**
   * Clear all states
   */
  clear(): void {
    this.states.clear();
    this.transitions.clear();
    this.currentState = null;
    this.previousState = null;
    this.stateStack = [];
    this.transitionQueue = [];
  }

  /**
   * Get debug info
   */
  getDebugInfo(): object {
    return {
      current: this.currentState,
      previous: this.previousState,
      stack: [...this.stateStack],
      states: Array.from(this.states.keys()),
      isTransitioning: this.isTransitioning,
      queueLength: this.transitionQueue.length,
    };
  }
}

// Factory function for creating game state machines
export function createGameStateMachine<TContext>(context: TContext): StateMachine<TContext> {
  return new StateMachine(context);
}
