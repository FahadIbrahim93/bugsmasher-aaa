/**
 * Entity Component System (ECS) Core
 * High-performance ECS implementation with archetype support
 */

import type {
  Entity,
  EntityId,
  Component,
  ComponentType,
  System,
  SystemPriority,
} from '@typedefs/index';
import { EventManager } from './EventManager';

// Priority order for system execution
const PRIORITY_ORDER: Record<SystemPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export class ECSWorld {
  private entities: Map<EntityId, Entity> = new Map();
  private systems: System[] = [];
  private componentPools: Map<ComponentType, Component[]> = new Map();
  private entityIdCounter: number = 0;
  private events: EventManager;

  // Query cache for performance
  private queryCache: Map<string, Entity[]> = new Map();
  private cacheInvalid: boolean = true;

  constructor() {
    this.events = EventManager.getInstance();
  }

  /**
   * Get the world's event manager
   */
  getEvents(): EventManager {
    return this.events;
  }

  /**
   * Create a new entity
   */
  createEntity(tag?: string): Entity {
    const id = `entity_${++this.entityIdCounter}`;
    const entity: Entity = {
      id,
      components: new Map(),
      active: true,
      tag,
      layer: 0,
    };

    this.entities.set(id, entity);
    this.cacheInvalid = true;

    this.events.emit('entity:created', { entityId: id, tag });

    return entity;
  }

  /**
   * Remove an entity and all its components
   */
  removeEntity(entityId: EntityId): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    // Return components to pools
    for (const [type, component] of entity.components) {
      this.returnComponentToPool(type, component);
    }

    this.entities.delete(entityId);
    this.cacheInvalid = true;

    this.events.emit('entity:removed', { entityId });

    // Notify systems
    for (const system of this.systems) {
      system.onEntityRemoved?.(entity);
    }

    return true;
  }

  /**
   * Add a component to an entity
   */
  addComponent(entityId: EntityId, component: Component): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    component.entityId = entityId;
    entity.components.set(component.type, component);
    this.cacheInvalid = true;

    this.events.emit('component:added', { entityId, componentType: component.type });

    // Notify systems
    for (const system of this.systems) {
      system.onEntityAdded?.(entity);
    }

    return true;
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    const component = entity.components.get(componentType);
    if (!component) return false;

    this.returnComponentToPool(componentType, component);
    entity.components.delete(componentType);
    this.cacheInvalid = true;

    this.events.emit('component:removed', { entityId, componentType });

    return true;
  }

  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: ComponentType): T | undefined {
    const entity = this.entities.get(entityId);
    return entity?.components.get(componentType) as T | undefined;
  }

  /**
   * Get a component from a specific entity (Type-safe)
   */
  getComponentFromEntity<T extends Component>(entity: Entity, type: ComponentType): T | undefined {
    return entity.components.get(type) as T | undefined;
  }

  /**
   * Check if entity has a component
   */
  hasComponent(entityId: EntityId, componentType: ComponentType): boolean {
    const entity = this.entities.get(entityId);
    return entity?.components.has(componentType) ?? false;
  }

  /**
   * Query entities by component types
   */
  query(...componentTypes: ComponentType[]): Entity[] {
    const cacheKey = componentTypes.sort().join(',');

    if (!this.cacheInvalid && this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    const results: Entity[] = [];

    for (const entity of this.entities.values()) {
      if (!entity.active) continue;

      const hasAll = componentTypes.every(type => entity.components.has(type));
      if (hasAll) {
        results.push(entity);
      }
    }

    if (this.cacheInvalid) {
      this.queryCache.clear();
      this.cacheInvalid = false;
    }

    this.queryCache.set(cacheKey, results);
    return results;
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get all entities with a specific tag
   */
  getEntitiesByTag(tag: string): Entity[] {
    return Array.from(this.entities.values()).filter(e => e.tag === tag && e.active);
  }

  /**
   * Register a system
   */
  registerSystem(system: System): void {
    // Insert in priority order
    const priority = PRIORITY_ORDER[system.priority];
    const insertIndex = this.systems.findIndex(s => PRIORITY_ORDER[s.priority] > priority);

    if (insertIndex === -1) {
      this.systems.push(system);
    } else {
      this.systems.splice(insertIndex, 0, system);
    }

    // Notify system of existing entities
    for (const entity of this.entities.values()) {
      system.onEntityAdded?.(entity);
    }
  }

  /**
   * Unregister a system
   */
  unregisterSystem(systemName: string): boolean {
    const index = this.systems.findIndex(s => s.name === systemName);
    if (index === -1) return false;

    this.systems.splice(index, 1);
    return true;
  }

  /**
   * Update all systems
   */
  update(deltaTime: number): void {
    for (const system of this.systems) {
      if (system.enabled) {
        try {
          system.update(deltaTime);
        } catch (error) {
          console.error(`Error in system ${system.name}:`, error);
        }
      }
    }

    // Process any queued events
    this.events.processQueue();
  }

  /**
   * Fixed update for physics
   */
  fixedUpdate(fixedDeltaTime: number): void {
    for (const system of this.systems) {
      if (system.enabled && system.fixedUpdate) {
        try {
          system.fixedUpdate(fixedDeltaTime);
        } catch (error) {
          console.error(`Error in system ${system.name} fixedUpdate:`, error);
        }
      }
    }
  }

  /**
   * Render all systems
   */
  render(interpolation: number): void {
    for (const system of this.systems) {
      if (system.enabled && system.render) {
        try {
          system.render(interpolation);
        } catch (error) {
          console.error(`Error in system ${system.name} render:`, error);
        }
      }
    }
  }

  /**
   * Get component from pool or create new
   */
  getComponentFromPool<T extends Component>(type: ComponentType, factory: () => T): T {
    const pool = this.componentPools.get(type);
    if (pool && pool.length > 0) {
      return pool.pop() as T;
    }
    return factory();
  }

  /**
   * Return component to pool for reuse
   */
  private returnComponentToPool(type: ComponentType, component: Component): void {
    if (!this.componentPools.has(type)) {
      this.componentPools.set(type, []);
    }

    const pool = this.componentPools.get(type)!;
    if (pool.length < 100) { // Max pool size
      component.enabled = false;
      component.entityId = undefined;
      pool.push(component);
    }
  }

  /**
   * Get world statistics
   */
  getStats(): { entities: number; systems: number; componentPools: number } {
    let poolCount = 0;
    for (const pool of this.componentPools.values()) {
      poolCount += pool.length;
    }

    return {
      entities: this.entities.size,
      systems: this.systems.length,
      componentPools: poolCount,
    };
  }

  /**
   * Clear all entities and systems
   */
  clear(): void {
    this.entities.clear();
    this.systems = [];
    this.componentPools.clear();
    this.queryCache.clear();
    this.cacheInvalid = true;
    this.entityIdCounter = 0;
  }
}

// Global ECS world instance
export const World = new ECSWorld();
