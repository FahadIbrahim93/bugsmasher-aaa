/**
 * Core ECS Components
 */
import type { Component, Vec2 } from '@typedefs/index';
import { BugType, BehaviorType, BugState } from '@typedefs/index';

import { 
  TransformComponent, 
  VelocityComponent, 
  SpriteComponent, 
  ColliderComponent, 
  HealthComponent, 
  BugBehaviorComponent 
} from '@typedefs/index';

export function createTransformComponent(x: number, y: number, rotation: number = 0, scaleX: number = 1, scaleY: number = 1): TransformComponent {
  return {
    type: 'transform',
    enabled: true,
    position: { x, y },
    rotation,
    scale: { x: scaleX, y: scaleY }
  };
}

export function createVelocityComponent(x: number, y: number, angularVelocity: number = 0): VelocityComponent {
  return {
    type: 'velocity',
    enabled: true,
    velocity: { x, y },
    angularVelocity
  };
}

export function createSpriteComponent(spriteKey: string, width: number, height: number, color: { r: number, g: number, b: number, a: number } = { r: 1, g: 1, b: 1, a: 1 }): SpriteComponent {
  return {
    type: 'sprite',
    enabled: true,
    spriteKey,
    width,
    height,
    color
  };
}

export function createColliderComponent(radius: number): ColliderComponent {
  return {
    type: 'collider',
    enabled: true,
    radius
  };
}

export function createHealthComponent(health: number, maxHealth: number): HealthComponent {
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
): BugBehaviorComponent {
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
