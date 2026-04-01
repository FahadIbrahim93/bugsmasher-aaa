/**
 * Integration Tests
 * Tests for system interactions and game flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ECSWorld } from '@core/ECS';
import { EventManager } from '@core/EventManager';
import { ParticleSystem } from '@systems/ParticleSystem';

describe('ECS + EventManager Integration', () => {
  let world: ECSWorld;
  let events: EventManager;

  beforeEach(() => {
    events = EventManager.getInstance();
    events.clear();
    world = new ECSWorld();
  });

  it('should emit events on entity creation and removal', () => {
    const createdCb = vi.fn();
    const removedCb = vi.fn();

    events.on('entity:created', createdCb);
    events.on('entity:removed', removedCb);

    const entity = world.createEntity('test');
    expect(createdCb).toHaveBeenCalledTimes(1);

    world.removeEntity(entity.id);
    expect(removedCb).toHaveBeenCalledTimes(1);
  });

  it('should emit events on component changes', () => {
    const addedCb = vi.fn();
    const removedCb = vi.fn();

    events.on('component:added', addedCb);
    events.on('component:removed', removedCb);

    const entity = world.createEntity();
    world.addComponent(entity.id, { type: 'test', enabled: true });
    expect(addedCb).toHaveBeenCalledTimes(1);

    world.removeComponent(entity.id, 'test');
    expect(removedCb).toHaveBeenCalledTimes(1);
  });
});

describe('ParticleSystem', () => {
  let particles: ParticleSystem;

  beforeEach(() => {
    particles = new ParticleSystem(500);
  });

  it('should emit particles', () => {
    particles.emit({ position: { x: 100, y: 100 }, count: 10 });
    expect(particles.getCount()).toBe(10);
  });

  it('should update and decay particles', () => {
    particles.emit({
      position: { x: 0, y: 0 },
      count: 5,
      minLife: 0.1,
      maxLife: 0.1,
    });

    expect(particles.getCount()).toBe(5);

    // Advance time past particle lifetime
    particles.update(0.2);
    expect(particles.getCount()).toBe(0);
  });

  it('should emit burst presets', () => {
    particles.burst({ x: 50, y: 50 }, 'explosion');
    expect(particles.getCount()).toBeGreaterThan(0);
  });

  it('should respect max particle limit', () => {
    const system = new ParticleSystem(20);
    system.emit({ position: { x: 0, y: 0 }, count: 50 });
    expect(system.getCount()).toBeLessThanOrEqual(20);
  });

  it('should clear all particles', () => {
    particles.emit({ position: { x: 0, y: 0 }, count: 20 });
    particles.clear();
    expect(particles.getCount()).toBe(0);
  });
});
