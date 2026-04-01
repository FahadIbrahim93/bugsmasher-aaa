import type { Vec2, System } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';

export class BugBehaviorSystem implements System {
  name = 'BugBehaviorSystem';
  priority = 'normal' as const;
  enabled = true;

  constructor(private world: ECSWorld, private targetPos: Vec2) {}

  update(_deltaTime: number): void {
    const bugs = this.world.query('bug_behavior', 'transform', 'velocity');
    
    for (const entity of bugs) {
      if (!entity.active) continue;

      const behavior = this.world.getComponentFromEntity<BugBehaviorComponent>(entity, 'bug_behavior');
      const transform = this.world.getComponentFromEntity<TransformComponent>(entity, 'transform');
      const velocity = this.world.getComponentFromEntity<VelocityComponent>(entity, 'velocity');

      if (!behavior || !transform || !velocity) continue;

      // Keep it simple: always chase target for now.
      // Evolve logic to use behavior.behaviors (WANDER, DASH, ZIGZAG) later.

      // Chase specific center target
      const dx = this.targetPos.x - transform.position.x;
      const dy = this.targetPos.y - transform.position.y;
      
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        // Normalize and scale by speed
        const dirX = dx / dist;
        const dirY = dy / dist;
        velocity.velocity.x = dirX * behavior.speed;
        velocity.velocity.y = dirY * behavior.speed;

        // Rotate bug towards walking direction
        transform.rotation = Math.atan2(dirY, dirX) + Math.PI / 2;

        // Check for player damage (if bug reaches center)
        if (dist < 30) {
          this.world.getEvents().emit('player:damage', { amount: 5 });
          this.world.removeEntity(entity.id);
        }
      }
    }
  }

  setTarget(pos: Vec2): void {
    this.targetPos = pos;
  }
}
