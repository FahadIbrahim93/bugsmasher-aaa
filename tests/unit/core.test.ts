/**
 * Core Unit Tests
 * Tests for ECS, EventManager, and StateMachine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ECSWorld } from '@core/ECS';
import { EventManager } from '@core/EventManager';
import { StateMachine } from '@core/StateMachine';

// ============================================================================
// EventManager Tests
// ============================================================================
describe('EventManager', () => {
  let events: EventManager;

  beforeEach(() => {
    events = EventManager.getInstance();
    events.clear();
  });

  it('should subscribe and emit events', () => {
    const callback = vi.fn();
    events.on('test:event', callback);
    events.emit('test:event', { value: 42 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ value: 42 });
  });

  it('should handle multiple subscribers', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    events.on('test:event', cb1);
    events.on('test:event', cb2);
    events.emit('test:event', 'hello');

    expect(cb1).toHaveBeenCalledWith('hello');
    expect(cb2).toHaveBeenCalledWith('hello');
  });

  it('should respect priority ordering', () => {
    const order: number[] = [];

    events.on('test:priority', () => order.push(1), 1);
    events.on('test:priority', () => order.push(3), 3);
    events.on('test:priority', () => order.push(2), 2);
    events.emit('test:priority');

    expect(order).toEqual([3, 2, 1]);
  });

  it('should handle once subscriptions', () => {
    const callback = vi.fn();
    events.once('test:once', callback);

    events.emit('test:once', 'first');
    events.emit('test:once', 'second');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');
  });

  it('should unsubscribe by ID', () => {
    const callback = vi.fn();
    const id = events.on('test:unsub', callback);

    events.emit('test:unsub');
    expect(callback).toHaveBeenCalledTimes(1);

    events.off(id);
    events.emit('test:unsub');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should queue and process events', () => {
    const callback = vi.fn();
    events.on('test:queue', callback);

    events.queue('test:queue', 'queued');
    expect(callback).not.toHaveBeenCalled();

    events.processQueue();
    expect(callback).toHaveBeenCalledWith('queued');
  });

  it('should report stats correctly', () => {
    events.on('a', () => {});
    events.on('a', () => {});
    events.on('b', () => {});

    const stats = events.getStats();
    expect(stats.totalSubscriptions).toBe(3);
    expect(stats.eventTypes).toBe(2);
  });
});

// ============================================================================
// ECSWorld Tests
// ============================================================================
describe('ECSWorld', () => {
  let world: ECSWorld;

  beforeEach(() => {
    // Use a fresh world for each test
    world = new ECSWorld();
  });

  it('should create entities', () => {
    const entity = world.createEntity('test');

    expect(entity.id).toBeTruthy();
    expect(entity.tag).toBe('test');
    expect(entity.active).toBe(true);
  });

  it('should add and get components', () => {
    const entity = world.createEntity();
    const component = { type: 'position', enabled: true, x: 10, y: 20 };

    world.addComponent(entity.id, component);

    const retrieved = world.getComponent(entity.id, 'position');
    expect(retrieved).toBeDefined();
    expect((retrieved as any).x).toBe(10);
  });

  it('should query entities by component type', () => {
    const e1 = world.createEntity();
    const e2 = world.createEntity();
    const e3 = world.createEntity();

    world.addComponent(e1.id, { type: 'position', enabled: true });
    world.addComponent(e1.id, { type: 'velocity', enabled: true });
    world.addComponent(e2.id, { type: 'position', enabled: true });
    world.addComponent(e3.id, { type: 'velocity', enabled: true });

    const withPosition = world.query('position');
    expect(withPosition.length).toBe(2);

    const withBoth = world.query('position', 'velocity');
    expect(withBoth.length).toBe(1);
  });

  it('should remove entities', () => {
    const entity = world.createEntity();
    world.addComponent(entity.id, { type: 'test', enabled: true });

    const removed = world.removeEntity(entity.id);
    expect(removed).toBe(true);
    expect(world.getEntity(entity.id)).toBeUndefined();
  });

  it('should remove components', () => {
    const entity = world.createEntity();
    world.addComponent(entity.id, { type: 'test', enabled: true });

    world.removeComponent(entity.id, 'test');
    expect(world.hasComponent(entity.id, 'test')).toBe(false);
  });

  it('should find entities by tag', () => {
    world.createEntity('enemy');
    world.createEntity('enemy');
    world.createEntity('player');

    const enemies = world.getEntitiesByTag('enemy');
    expect(enemies.length).toBe(2);
  });

  it('should register and update systems', () => {
    const updateFn = vi.fn();
    world.registerSystem({
      name: 'TestSystem',
      priority: 'normal',
      enabled: true,
      update: updateFn,
    });

    world.update(0.016);
    expect(updateFn).toHaveBeenCalledWith(0.016);
  });

  it('should report stats', () => {
    world.createEntity();
    world.createEntity();

    const stats = world.getStats();
    expect(stats.entities).toBe(2);
  });
});

// ============================================================================
// StateMachine Tests
// ============================================================================
describe('StateMachine', () => {
  let sm: StateMachine<{ value: number }>;

  beforeEach(() => {
    const events = EventManager.getInstance();
    events.clear();
    sm = new StateMachine({ value: 0 });
  });

  it('should register and transition to states', async () => {
    sm.registerState({ name: 'idle' });
    sm.registerState({ name: 'running' });

    await sm.transitionTo('idle', true);
    expect(sm.getCurrentState()).toBe('idle');

    await sm.transitionTo('running', true);
    expect(sm.getCurrentState()).toBe('running');
  });

  it('should call onEnter and onExit', async () => {
    const onEnter = vi.fn();
    const onExit = vi.fn();

    sm.registerState({ name: 'a', onExit });
    sm.registerState({ name: 'b', onEnter });

    await sm.transitionTo('a', true);
    await sm.transitionTo('b', true);

    expect(onExit).toHaveBeenCalled();
    expect(onEnter).toHaveBeenCalled();
  });

  it('should support push/pop for state stacking', async () => {
    const onPause = vi.fn();
    const onResume = vi.fn();

    sm.registerState({ name: 'playing', onPause, onResume });
    sm.registerState({ name: 'paused' });

    await sm.transitionTo('playing', true);
    await sm.pushState('paused');

    expect(sm.getCurrentState()).toBe('paused');
    expect(onPause).toHaveBeenCalled();

    await sm.popState();
    expect(sm.getCurrentState()).toBe('playing');
    expect(onResume).toHaveBeenCalled();
  });

  it('should track previous state', async () => {
    sm.registerState({ name: 'a' });
    sm.registerState({ name: 'b' });

    await sm.transitionTo('a', true);
    await sm.transitionTo('b', true);

    expect(sm.getPreviousState()).toBe('a');
  });

  it('should check current state', async () => {
    sm.registerState({ name: 'test' });
    await sm.transitionTo('test', true);

    expect(sm.isInState('test')).toBe(true);
    expect(sm.isInState('other')).toBe(false);
  });
});
