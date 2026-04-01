/**
 * Event Manager
 * Type-safe event system with priority support and memory management
 */

import type { GameEvent, EventCallback, EventSubscription } from '@typedefs/index';

export class EventManager {
  private static instance: EventManager;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private subscriptionCounter: number = 0;
  private eventQueue: GameEvent[] = [];
  private isProcessing: boolean = false;
  private maxQueueSize: number = 1000;

  private constructor() {}

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Subscribe to an event type
   */
  on<T = unknown>(
    eventType: string,
    callback: EventCallback<T>,
    priority: number = 0,
    once: boolean = false
  ): string {
    const id = `sub_${++this.subscriptionCounter}`;

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subs = this.subscriptions.get(eventType)!;
    const sub: EventSubscription = {
      id,
      type: eventType,
      callback: callback as EventCallback,
      priority,
      once,
    };

    // Insert in priority order (higher first)
    const insertIndex = subs.findIndex(s => s.priority < priority);
    if (insertIndex === -1) {
      subs.push(sub);
    } else {
      subs.splice(insertIndex, 0, sub);
    }

    return id;
  }

  /**
   * Subscribe once to an event
   */
  once<T = unknown>(
    eventType: string,
    callback: EventCallback<T>,
    priority: number = 0
  ): string {
    return this.on(eventType, callback, priority, true);
  }

  /**
   * Unsubscribe from an event
   */
  off(subscriptionId: string): boolean {
    for (const [eventType, subs] of this.subscriptions) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(eventType);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Unsubscribe all listeners for an event type
   */
  offAll(eventType?: string): void {
    if (eventType) {
      this.subscriptions.delete(eventType);
    } else {
      this.subscriptions.clear();
    }
  }

  /**
   * Emit an event immediately
   */
  emit<T = unknown>(eventType: string, data?: T, source?: string): void {
    const event: GameEvent = {
      type: eventType,
      timestamp: performance.now(),
      data,
      source,
    };

    this.processEvent(event);
  }

  /**
   * Queue an event for next frame processing
   */
  queue<T = unknown>(eventType: string, data?: T, source?: string): void {
    if (this.eventQueue.length >= this.maxQueueSize) {
      console.warn(`Event queue full, dropping event: ${eventType}`);
      return;
    }

    this.eventQueue.push({
      type: eventType,
      timestamp: performance.now(),
      data,
      source,
    });
  }

  /**
   * Process all queued events
   */
  processQueue(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }

    this.isProcessing = false;
  }

  private processEvent(event: GameEvent): void {
    const subs = this.subscriptions.get(event.type);
    if (!subs || subs.length === 0) return;

    const toRemove: string[] = [];

    for (const sub of subs) {
      try {
        sub.callback(event.data);
        if (sub.once) {
          toRemove.push(sub.id);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Remove once subscriptions
    for (const id of toRemove) {
      this.off(id);
    }
  }

  /**
   * Get subscription count for debugging
   */
  getStats(): { totalSubscriptions: number; eventTypes: number; queueSize: number } {
    let total = 0;
    for (const subs of this.subscriptions.values()) {
      total += subs.length;
    }
    return {
      totalSubscriptions: total,
      eventTypes: this.subscriptions.size,
      queueSize: this.eventQueue.length,
    };
  }

  /**
   * Clear all events and subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
    this.eventQueue = [];
    this.subscriptionCounter = 0;
  }
}

// Global event manager instance
export const Events = EventManager.getInstance();
