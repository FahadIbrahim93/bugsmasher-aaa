import type { Entity, Vec2 } from '@typedefs/index';
import { BugType } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';
import { BUG_DEFINITIONS } from '@config/GameConfig';
import { 
  createTransformComponent, 
  createVelocityComponent, 
  createSpriteComponent, 
  createColliderComponent, 
  createHealthComponent, 
  createBugBehaviorComponent 
} from '@components/index';

export function spawnBug(world: ECSWorld, type: BugType, startPosition: Vec2, baseMultiplier: number = 1.0): Entity {
  const def = BUG_DEFINITIONS[type];
  const entity = world.createEntity();
  
  // Tag it as a bug for easy querying
  entity.tag = 'bug';
  
  const health = def.stats.health * baseMultiplier;

  // Add Components
  world.addComponent(entity.id, createTransformComponent(startPosition.x, startPosition.y, 0, def.scale, def.scale));
  world.addComponent(entity.id, createVelocityComponent(0, 0)); // Will be updated by behavior system
  
  // Base sprite size, the renderer scales it via transform
  // Typical size 64x64 baseline
  world.addComponent(entity.id, createSpriteComponent(def.spriteKey, 64, 64));
  
  // Approximate collider hit radius based on baseline 64 * scale
  world.addComponent(entity.id, createColliderComponent(32 * def.scale));
  
  world.addComponent(entity.id, createHealthComponent(health, health));
  world.addComponent(entity.id, createBugBehaviorComponent(
    type,
    def.behaviors,
    def.stats.speed * baseMultiplier,
    Math.round(def.stats.scoreValue * baseMultiplier)
  ));
  
  return entity;
}
