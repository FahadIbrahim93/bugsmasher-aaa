/**
 * Core ECS Components
 */
import type { Component, ComponentType, Vec2 } from '@typedefs/index';
import { BugType, BehaviorType, BugState } from '@typedefs/index';

export function createTransformComponent(x: number, y: number, rotation: number = 0, scaleX: number = 1, scaleY: number = 1): Component & { position: Vec2, rotation: number, scale: Vec2 } {
  return {
    type: 'transform',
    enabled: true,
    position: { x, y },
    rotation,
    scale: { x: scaleX, y: scaleY }
  };
}

export function createVelocityComponent(x: number, y: number, angularVelocity: number = 0): Component & { velocity: Vec2, angularVelocity: number } {
  return {
    type: 'velocity',
    enabled: true,
    velocity: { x, y },
    angularVelocity
  };
}

export function createSpriteComponent(spriteKey: string, width: number, height: number, color: { r: number, g: number, b: number, a: number } = { r: 1, g: 1, b: 1, a: 1 }): Component & { spriteKey: string, width: number, height: number, color: { r: number, g: number, b: number, a: number } } {
  return {
    type: 'sprite',
    enabled: true,
    spriteKey,
    width,
    height,
    color
  };
}

export function createColliderComponent(radius: number): Component & { radius: number } {
  return {
    type: 'collider',
    enabled: true,
    radius
  };
}

export function createHealthComponent(health: number, maxHealth: number): Component & { health: number, maxHealth: number, flashTimer: number } {
  return {
    type: 'health',
    enabled: true,
    health,
    maxHealth,
    flashTimer: 0
  };
}

export function createBugBehaviorComponent(
  bugType: BugType,
  behaviors: BehaviorType[],
  speed: number,
  scoreValue: number
): Component & { bugType: BugType, state: BugState, behaviors: BehaviorType[], speed: number, scoreValue: number, stateTimer: number, target: Vec2 | null } {
  return {
    type: 'bug_behavior',
    enabled: true,
    bugType,
    state: BugState.SPAWNING,
    behaviors,
    speed,
    scoreValue,
    stateTimer: 0,
    target: null
  };
}
